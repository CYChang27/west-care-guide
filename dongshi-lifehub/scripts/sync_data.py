#!/usr/bin/env python3
"""Download official Taiwan open data for the Dongshi Li (East District) website.

Do not call this "real-time": the water feed updates irregularly and the Taipower
planned-outage feed updates daily. A live outage must be checked in Taipower's portal.
"""
from __future__ import annotations

import csv
import io
import json
import logging
import re
import sys
import urllib.request
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parents[1]
OUTPUT = HERE / "data" / "status.json"
TZ = ZoneInfo("Asia/Taipei")
WATER_URL = "https://web.water.gov.tw/wateroffapi/openData/export/json"
POWER_URL = "https://service.taipower.com.tw/data/opendata/apply/file/d077004/001.zip"
LOG = logging.getLogger("dongshi_sync")


def now():
    return datetime.now(TZ)


def stamp():
    return now().isoformat(timespec="seconds")


def txt(v):
    return "" if v is None else str(v).strip()


def choose(row, *keys):
    for key in keys:
        if key in row and txt(row[key]):
            return txt(row[key])
    return ""


def get_bytes(url):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Dongshi-Li-Community-Info/1.0 (read-only public open-data client)",
            "Accept": "application/json, application/zip, text/csv, */*",
        },
    )
    with urllib.request.urlopen(request, timeout=35) as response:
        body = response.read(20_000_001)
        if len(body) > 20_000_000:
            raise ValueError("Data unexpectedly large")
        return body


def decode_bytes(data):
    for enc in ("utf-8-sig", "utf-8", "cp950", "big5"):
        try:
            return data.decode(enc)
        except UnicodeError:
            pass
    raise ValueError("Unknown text encoding")


def find_rows(obj, depth=0):
    if depth > 4:
        raise ValueError("Unexpectedly nested JSON")
    if isinstance(obj, list):
        if all(isinstance(x, dict) for x in obj):
            return obj
        raise ValueError("Expected list of objects")
    if isinstance(obj, dict):
        for key in ("data", "Data", "DATA", "records", "Records", "result", "Result", "items", "Items"):
            if key in obj:
                value = obj[key]
                if isinstance(value, str) and value.strip().startswith(("[", "{")):
                    value = json.loads(value)
                return find_rows(value, depth + 1)
        if not obj:  # empty official feed
            return []
    raise ValueError("Unexpected feed JSON structure")


def parse_date(value):
    if not value:
        return None
    s = txt(value).replace("T", " ").replace("年", "/").replace("月", "/").replace("日", " ")
    s = s.replace(".", "/")
    s = re.sub(r"\s+", " ", s).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y/%m/%d %H:%M:%S", "%Y/%m/%d %H:%M", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=TZ)
        except ValueError:
            continue
    # Open data occasionally uses Republic of China years (115/11/12).
    m = re.match(r"^(\d{2,3})[/-](\d{1,2})[/-](\d{1,2})(?:[ T]+(\d{1,2}):(\d{2}))?", s)
    if m:
        y, mo, day, hr, minute = m.groups()
        try:
            return datetime(int(y) + 1911, int(mo), int(day), int(hr or 0), int(minute or 0), tzinfo=TZ)
        except ValueError:
            return None
    return None


def relevant_date(row, start, end):
    # Keep recent and forthcoming items; avoid publishing obsolete open-data records.
    cutoff = now() - timedelta(days=1)
    max_future = now() + timedelta(days=45)
    end_dt = parse_date(end)
    start_dt = parse_date(start)
    if end_dt and end_dt < cutoff:
        return False
    if start_dt and start_dt > max_future:
        return False
    if start_dt and not end_dt and start_dt < now() - timedelta(days=7):
        return False
    return True


def clean_reason(s):
    v = txt(s)
    # Some entries serialize an array into text; show something meaningful.
    if v.startswith("[") and v.endswith("]"):
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                v = "；".join(map(txt, parsed))
        except (ValueError, TypeError):
            pass
    return v[:380]


def parse_water(data):
    records = find_rows(json.loads(decode_bytes(data)))
    result = []
    for row in records:
        county = choose(row, "影響縣市", "縣市", "County")
        district = choose(row, "影響行政區", "行政區", "District")
        # Filter strictly to Taichung's EAST DISTRICT, NOT Dongshi District (東勢區).
        # If an announcement is only labelled citywide it cannot be safely attributed to Dongshi Li.
        if not any(s in county for s in ("臺中", "台中")) or "東區" not in district:
            continue
        start = choose(row, "案件日期時間", "開始日期時間", "停水開始時間", "開始時間")
        end = choose(row, "恢復日期時間", "結束日期時間", "恢復時間")
        if not relevant_date(row, start, end):
            continue
        water_area = choose(row, "停水地區", "停水範圍")
        reduced_area = choose(row, "降壓地區", "降壓範圍")
        kind = "降壓" if reduced_area and not water_area else ("停水／降壓" if reduced_area and water_area else "停水")
        area = water_area or reduced_area or (county + district)
        reason = choose(row, "停水原因", "降壓原因", "原因", "工程名稱")
        if not reason:
            reason = choose(row, "降壓原因")
        result.append({
            "id": choose(row, "案件編號", "編號"),
            "type": kind,
            "area": area[:430],
            "start": start,
            "end": end,
            "reason": clean_reason(reason),
        })
    return sorted(result, key=lambda r: txt(r.get("start")))[:35]


def csv_rows(blob):
    s = decode_bytes(blob).replace("\x00", "")
    head = s[:4000]
    try:
        dialect = csv.Sniffer().sniff(head, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    return list(csv.DictReader(io.StringIO(s), dialect=dialect))


def excel_rows(blob, suffix):
    if suffix == ".xlsx":
        try:
            from openpyxl import load_workbook
        except ImportError as e:
            raise RuntimeError("Install openpyxl for Excel feeds") from e
        wb = load_workbook(io.BytesIO(blob), read_only=True, data_only=True)
        result = []
        for ws in wb:
            rows = ws.iter_rows(values_only=True)
            header = next(rows, None)
            if not header:
                continue
            keys = [txt(x).replace("\n", "") for x in header]
            for row in rows:
                if any(txt(v) for v in row):
                    result.append(dict(zip(keys, map(txt, row))))
        wb.close()
        return result
    if suffix == ".xls":
        try:
            import xlrd
        except ImportError as e:
            raise RuntimeError("Install xlrd for old Excel feeds") from e
        book = xlrd.open_workbook(file_contents=blob)
        result = []
        for sheet in book.sheets():
            if sheet.nrows == 0:
                continue
            keys = [txt(x) for x in sheet.row_values(0)]
            for i in range(1, sheet.nrows):
                values = [txt(x) for x in sheet.row_values(i)]
                if any(values):
                    result.append(dict(zip(keys, values)))
        return result
    raise ValueError("Unsupported Excel extension")


def parse_power(data):
    if not zipfile.is_zipfile(io.BytesIO(data)):
        raise ValueError("Taipower URL did not return a ZIP archive")
    rows = []
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        for name in archive.namelist():
            suffix = Path(name).suffix.lower()
            if suffix not in (".csv", ".json", ".xlsx", ".xls"):
                continue
            blob = archive.read(name)
            if suffix == ".csv":
                rows.extend(csv_rows(blob))
            elif suffix == ".json":
                rows.extend(find_rows(json.loads(decode_bytes(blob))))
            else:
                rows.extend(excel_rows(blob, suffix))
    if not rows:
        raise ValueError("No readable CSV/JSON/Excel records found in Taipower ZIP")
    results = []
    for row in rows:
        scope = choose(row, "停電範圍", "停電區域", "停電地區", "影響範圍")
        area = re.sub(r"\s+", "", scope)
        # Other cities also have an East District. Require explicit Taichung,
        # or a Taichung branch with no conflicting county/city in the scope.
        branch = choose(row, "營業區處", "營業處", "區處")
        explicit_taichung = bool(re.search(r"(?:臺中市|台中市)東區", area))
        other_city = any(city in area for city in ("臺北市", "台北市", "新竹市", "嘉義市", "臺南市", "台南市", "高雄市", "新北市"))
        branch_based = ("臺中" in branch or "台中" in branch) and not other_city and ("東區" in area or "東勢里" in area)
        if not (explicit_taichung or branch_based):
            continue
        start = choose(row, "第一次停電時間", "停電開始時間", "停電時間", "開始時間")
        end = choose(row, "第二次停電時間", "預計復電時間", "結束時間")
        if not relevant_date(row, start, end):
            continue
        results.append({
            "id": choose(row, "請求號數", "案件編號"),
            "type": "計畫性停電",
            "area": scope[:430],
            "start": start,
            "end": end,
            "reason": choose(row, "工作概述", "工作內容", "停電原因")[:380],
        })
    return sorted(results, key=lambda r: txt(r.get("start")))[:35]


def previous():
    try:
        with OUTPUT.open(encoding="utf-8") as f:
            obj = json.load(f)
            return obj if isinstance(obj, dict) else {}
    except (OSError, ValueError):
        return {}


def sync_source(key, url, parser, old):
    try:
        items = parser(get_bytes(url))
        LOG.info("%s: matched %d East District records", key, len(items))
        return {"status": "ok", "last_success": stamp(), "items": items}
    except Exception as exc:
        LOG.warning("%s source unavailable: %s", key, exc)
        return {
            "status": "stale" if old.get("last_success") else "unavailable",
            "last_success": old.get("last_success"),
            "items": old.get("items", []),
        }


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    last = previous()
    output = {
        "generated_at": stamp(),
        "water": sync_source("water", WATER_URL, parse_water, last.get("water", {})),
        "power": sync_source("power", POWER_URL, parse_power, last.get("power", {})),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUTPUT.with_suffix(".tmp")
    temp.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(OUTPUT)
    LOG.info("Wrote %s", OUTPUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())

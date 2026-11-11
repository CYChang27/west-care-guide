#!/usr/bin/env python3
"""Sync Taichung EPB public collection points for East District, Dongshi Li.

Schedule source: https://data.gov.tw/dataset/84004
This is a *timetable*, not real-time vehicle GPS data.
"""
from __future__ import annotations

import csv
import io
import json
import logging
import re
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT = DATA_DIR / "garbage.json"
OFFICIAL_JSON = "https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=68d1a87f-7baa-4b50-8408-c36a3a7eda68"
OFFICIAL_CSV = "https://newdatacenter.taichung.gov.tw/api/v1/no-auth/resource.download?rid=3275290e-2375-437e-b7b1-998a4b4907b8"
WEEK = "一二三四五六日"
log = logging.getLogger("dongshi_garbage")


def clean(v):
    if v is None:
        return ""
    s = str(v).strip()
    return "" if s.lower() in ("null", "none", "undefined", "nan", "n/a") else s


def get(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Dongshi-Li-Community-Info/1.0 (public timetable data)",
        "Accept": "application/json, text/csv, application/octet-stream, */*",
    })
    with urllib.request.urlopen(req, timeout=70) as resp:
        blob = resp.read(55_000_001)
    if len(blob) > 55_000_000:
        raise ValueError("Official collection dataset unexpectedly large")
    return blob


def rows_from_json(obj, depth=0):
    if depth > 7:
        raise ValueError("Unexpected official JSON nesting")
    if isinstance(obj, list):
        if not all(isinstance(x, dict) for x in obj):
            raise ValueError("Expected list of objects")
        return obj
    if isinstance(obj, dict):
        for key in ("data", "Data", "result", "Result", "records", "Records",
                    "items", "Items", "rows", "Rows"):
            if key in obj:
                value = obj[key]
                if isinstance(value, str) and value.lstrip().startswith(("[", "{")):
                    value = json.loads(value)
                return rows_from_json(value, depth + 1)
    raise ValueError("Unexpected official JSON structure")


def load_rows():
    errors = []
    try:
        return rows_from_json(json.loads(get(OFFICIAL_JSON).decode("utf-8-sig")))
    except Exception as exc:
        errors.append(f"JSON: {exc}")
    try:
        blob = get(OFFICIAL_CSV)
        text = None
        for encoding in ("utf-8-sig", "utf-8", "cp950", "big5"):
            try:
                text = blob.decode(encoding)
                break
            except UnicodeError:
                pass
        if text is None:
            raise ValueError("Unknown CSV encoding")
        return list(csv.DictReader(io.StringIO(text)))
    except Exception as exc:
        errors.append(f"CSV: {exc}")
    raise RuntimeError("; ".join(errors))


def normalize_time(value):
    text = clean(value)
    if not text or text in ("0", "-", "不收運"):
        return ""
    found = re.search(r"(\d{1,2}):(\d{2})", text)
    if found:
        hr, minute = int(found.group(1)), int(found.group(2))
    else:
        found = re.fullmatch(r"(\d{3,4})", text)
        if not found:
            return ""
        n = found.group(1).zfill(4)
        hr, minute = int(n[:2]), int(n[2:])
    if hr > 23 or minute > 59:
        return ""
    return f"{hr:02}:{minute:02}"


def time_field(row, group, i, suffix):
    # Data.gov.tw metadata uses g_d1_time_s etc.; tolerate common aliases.
    aliases = (
        f"{group}_d{i}_time_{suffix}",
        f"{group}_d{i}_{suffix}",
        f"{group.upper()}_D{i}_TIME_{suffix.upper()}",
        f"{group.upper()}_D{i}_{suffix.upper()}",
    )
    for key in aliases:
        if key in row and normalize_time(row[key]):
            return normalize_time(row[key])
    return ""


def parse_stops(rows):
    merged = {}
    local_count = 0
    for row in rows:
        if not isinstance(row, dict):
            continue
        county_area = clean(row.get("area") or row.get("Area") or row.get("行政區"))
        village = clean(row.get("village") or row.get("Village") or row.get("里別"))
        # Critical: 東勢里 in 台中市東區 != 台中市東勢區.
        if "東區" not in county_area or village != "東勢里":
            continue
        local_count += 1
        address = clean(row.get("caption") or row.get("Caption") or row.get("清運地址"))
        address = re.sub(r"^(?:臺中市|台中市)?東區(?:東勢里)?", "", address).strip()
        car = clean(row.get("car_licence") or row.get("car_license") or row.get("車牌"))
        if not address:
            continue
        key = (address, car)
        point = merged.setdefault(key, {
            "address": address, "car": car,
            "garbage": {}, "recycling": {},
        })
        for i, day in enumerate(WEEK, start=1):
            for prefix, target in (("g", "garbage"), ("r", "recycling")):
                time = time_field(row, prefix, i, "s") or time_field(row, prefix, i, "e")
                if time:
                    prior = point[target].get(day)
                    # Keep every distinct official timetable time at the same
                    # stop/day instead of silently discarding a later recycling pass.
                    if not prior:
                        point[target][day] = time
                    else:
                        values = sorted(set(prior.split("、") + [time]))
                        point[target][day] = "、".join(values)
    if local_count < 10 or len(merged) < 7:
        raise ValueError(
            f"Too few 东區/東勢里 records; source structure may have changed: "
            f"rows={local_count}, unique={len(merged)}"
        )
    stops = sorted(merged.values(), key=lambda x: (
        min(list(x["garbage"].values()) + list(x["recycling"].values()) or ["99:99"]),
        x["address"], x["car"]
    ))
    return stops


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    previous = {}
    try:
        previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        pass
    try:
        source_rows = load_rows()
        stops = parse_stops(source_rows)
    except Exception as exc:
        log.warning("Official timetable sync unavailable: %s; preserving prior data", exc)
        return 0

    now = datetime.now(ZoneInfo("Asia/Taipei")).isoformat(timespec="seconds")
    result = {
        "source": "official",
        "source_note": "臺中市環保局開放資料之表定清運時間，非即時 GPS。若有停收或調整，請查環保局最新公告。",
        "source_url": "https://data.gov.tw/dataset/84004",
        "official_url": "https://cleaner.epb.taichung.gov.tw/",
        "updated_at": now,
        "district": "臺中市東區",
        "village": "東勢里",
        "stops": stops,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUTPUT.with_suffix(".tmp")
    tmp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(OUTPUT)
    log.info("Synced %d official Dongshi Li collection stops at %s", len(stops), now)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

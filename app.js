const baseResources = [
  {
    id: "health-center", category: "入口", topics: ["start", "health", "care"],
    title: "臺中市中西區衛生所", description: "不知道該找哪一種服務時，可先說明長者與家庭目前的困難，由衛生所協助釐清可用資源。",
    phone: "04-22223811", phoneHref: "tel:0422223811", link: "https://www.westcentralphc.taichung.gov.tw/", action: "官方網站"
  },
  {
    id: "ltc-1966", category: "長照", topics: ["start", "care", "rest", "safety"],
    title: "長照服務專線 1966", description: "可申請居家服務、日間照顧、交通接送、專業服務、輔具、居家無障礙與喘息等服務。",
    phone: "1966", phoneHref: "tel:1966", link: "https://www.health.taichung.gov.tw/26198/1614263/citizen/1617545/1620753/1660500/post", action: "查看申請方式"
  },
  {
    id: "ltc-list", category: "長照", topics: ["care", "rest", "safety"],
    title: "臺中市長照特約單位查詢", description: "依服務類型查看臺中市最新特約單位。名冊會更新，請以官方頁面資料為準。",
    link: "https://www.health.taichung.gov.tw/26198/1614263/1617544/1617545/1620732/1620733/1652443/post", action: "開啟最新名冊"
  },
  {
    id: "caregiver", category: "照顧者", topics: ["start", "rest"],
    title: "家庭照顧者支持服務", description: "提供照顧諮詢、到宅技巧指導、心理諮商、支持團體、工作坊及安全看視等服務。",
    link: "https://www.health.taichung.gov.tw/1655489/post", action: "查看最新據點"
  },
  {
    id: "red-cross", category: "照顧者", district: "中區", topics: ["rest"],
    title: "中西區家庭照顧者服務窗口", description: "中西區家庭照顧者支持服務由臺中市紅十字會承接。聯絡前可先準備目前照顧安排與最希望改善的問題。",
    address: "臺中市中區綠川西街145號7樓",
    phone: "04-2222-2411 分機436", phoneHref: "tel:0422222411", link: "https://www.health.taichung.gov.tw/1655489/post", action: "核對最新名冊"
  },
  {
    id: "migrant-1955", category: "外籍看護", topics: ["migrant"],
    title: "1955 勞工諮詢申訴專線", description: "提供印尼語、越南語、泰語、英語及中文的24小時諮詢與線上通譯，可由移工、雇主或仲介使用。",
    phone: "1955", phoneHref: "tel:1955", link: "https://www.mol.gov.tw/1607/1632/1640/44643/", action: "查看服務說明"
  },
  {
    id: "migrant-learning", category: "外籍看護", topics: ["migrant"],
    title: "外籍家庭看護工照護教材", description: "勞動力發展署提供多國語教材與數位課程，可依照護主題與語言查找。",
    link: "https://fw.wda.gov.tw/wda-employer/home/textbook", action: "開啟教材專區"
  },
  {
    id: "emergency-119", category: "安全", topics: ["safety", "health"],
    title: "119 救護與消防", description: "意識不清、呼吸困難、疑似中風、嚴重跌倒、噎到或其他立即危險時，請直接撥打。",
    phone: "119", phoneHref: "tel:119"
  },
  {
    id: "police-110", category: "安全", topics: ["safety"],
    title: "110 警察服務", description: "長者迷途、走失或有人身安全疑慮時，立即撥打並提供最後出現地點、衣著與特徵。",
    phone: "110", phoneHref: "tel:110"
  },
  {
    id: "mental-1925", category: "照顧者", topics: ["rest", "health"],
    title: "1925 安心專線", description: "照顧壓力造成明顯情緒困擾、失眠或無力感時，可先撥打24小時心理支持專線。",
    phone: "1925", phoneHref: "tel:1925", link: "https://www.mohw.gov.tw/cp-16-48244-1.html", action: "查看專線說明"
  },
  {
    id: "welfare-portal", category: "社會福利", topics: ["start", "welfare"],
    title: "臺中市社福便利站", description: "可依身分與生活困難查詢社會救助、急難救助、老人、家庭、婦女及其他福利服務。",
    link: "https://i-welfare.taichung.gov.tw/people/index", action: "查詢可用福利"
  },
  {
    id: "elder-welfare", category: "社會福利", topics: ["welfare"],
    title: "臺中市老人福利服務", description: "集中查詢老人福利、生活支持、敬老優待、住宅安全及其他高齡服務資訊。",
    link: "https://www.society.taichung.gov.tw/13783/Lpsimplelist", action: "查看老人福利"
  }

];

const resources = [
  ...baseResources.map(r => ({...r, ...(resourceBaseUpdates[r.id] || {})})),
  ...localResources
];
const datasetNote = document.querySelector('#dataset-note');
if (datasetNote) datasetNote.textContent = `收錄 ${localResources.length} 筆名冊與服務資料，另有 ${baseResources.length} 項官方與常用入口。資料更新：${resourceDataset.label}。`;



const resultTitle = document.querySelector('#result-title');
const resultDescription = document.querySelector('#result-description');
const resultSteps = document.querySelector('#result-steps');
const resultResources = document.querySelector('#result-resources');
const resultPanel = document.querySelector('#result-panel');
const grid = document.querySelector('#resource-grid');
const search = document.querySelector('#resource-search');
const noResults = document.querySelector('#no-results');
const resourceCount = document.querySelector('#resource-count');
const loadMore = document.querySelector('#load-more');
let activeFilter = 'all';
let activeDistrict = 'all';
let visibleCount = 12;
const pageSize = 12;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function googleMapsDirectionsUrl(resource) {
  const target = resource.mapAddress || resource.address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
}
function resourceAddress(r) {
  if (!r.address) {
    if (!r.nameOnly) return '';
    const area = ['中區','西區'].includes(r.district) ? r.district : '';
    const query = `臺中市${area} ${r.title}`;
    return `<a class="resource-address" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer"><span class="resource-address-pin" aria-hidden="true">⌕</span><span class="resource-address-text">依名稱搜尋地圖</span></a><p class="contact-note">名冊未附完整電話與地址，請核對地圖上的單位資訊。</p>`;
  }
  return `<a class="resource-address" href="${googleMapsDirectionsUrl(r)}" target="_blank" rel="noopener noreferrer" aria-label="使用 Google 地圖導航到 ${escapeHtml(r.title)}"><span class="resource-address-pin" aria-hidden="true">⌖</span><span class="resource-address-text">${escapeHtml(r.address)}</span><span class="resource-address-action">Google 導航</span></a>`;
}
function resourceActions(r) {
  const phone = r.phone && r.phoneHref ? `<a class="action-link phone" href="${escapeHtml(r.phoneHref)}">撥打 ${escapeHtml(r.phone)}</a>` : '';
  const link = r.link ? `<a class="action-link web" href="${escapeHtml(r.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.action || '查看官方資訊')}</a>` : '';
  const other = (r.additionalPhones || []).map(p => `<a class="action-link phone" href="${escapeHtml(p.phoneHref)}">${escapeHtml(p.label)} ${escapeHtml(p.phone)}</a>`).join('');
  return `<span class="action-row">${phone}${other}${link}</span>`;
}
function resourceDetails(r) {
  const detail = [r.hours && `活動時間：${r.hours}`, r.locationNote && `活動地點：${r.locationNote}`, r.serviceArea && `服務分區：${r.serviceArea}`, r.contactStatus, r.vaccineNote].filter(Boolean).map(t => `<p>${escapeHtml(t)}</p>`).join('');
  const source = r.source ? `<p>資料來源：${escapeHtml(r.source)}</p>` : '';
  return detail || source ? `<details class="resource-details"><summary>服務補充與資料來源</summary>${detail}${source}</details>` : '';
}

function catalogUrl(category, district = 'all') {
  const params = new URLSearchParams({category});
  if (district !== 'all') params.set('district', district);
  return `index.html?${params.toString()}#resources`;
}

function getScenarioResources(topic, district = 'all') {
  const item = scenarios[topic];
  const preferred = item.resourceIds || (topic === 'health' ? ['health-center', 'local-146', 'local-147'] : []);
  return resources.filter(r => {
    const match = item.resourceIds ? item.resourceIds.includes(r.id) : item.catalog ? (r.categories || [r.category]).includes(item.catalog) : r.topics.includes(topic);
    return match && (!item.locationChoice || district === 'all' || r.district === district);
  }).sort((a,b) => {
    if (topic === 'health') {
      const names = ['臺中市中西區衛生所','衛生福利部臺中醫院','澄清綜合醫院平等院區'];
      return (names.indexOf(a.title) < 0 ? 999 : names.indexOf(a.title)) - (names.indexOf(b.title) < 0 ? 999 : names.indexOf(b.title));
    }
    if (item.resourceIds) return preferred.indexOf(a.id) - preferred.indexOf(b.id);
    return Number(Boolean(a.nameOnly)) - Number(Boolean(b.nameOnly)) || (topic === 'community' ? Number(Boolean(b.hours)) - Number(Boolean(a.hours)) : 0);
  });
}

function showScenario(topic) {
  const item = scenarios[topic];
  resultPanel.dataset.topic = topic;
  resultTitle.textContent = item.title;
  resultDescription.textContent = item.description;
  resultSteps.innerHTML = item.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('');
  const script = document.querySelector('#result-script');
  script.hidden = !item.script;
  script.textContent = item.script ? `聯絡時可以這樣說：「${item.script}」` : '';
  const location = document.querySelector('#scenario-location');
  const locationWrap = document.querySelector('#scenario-location-wrap');
  locationWrap.hidden = !item.locationChoice;
  const note = document.querySelector('#result-resource-note');
  note.textContent = item.resourceNote || '';
  note.hidden = !item.resourceNote;
  const related = document.querySelector('#result-related');
  related.innerHTML = (item.sourceLink ? `<a class="action-link web" href="${escapeHtml(item.sourceLink.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceLink.label)}</a>` : '') +
    (item.secondaryCatalog ? `<a class="action-link web" href="${catalogUrl(item.secondaryCatalog.category)}">${escapeHtml(item.secondaryCatalog.label)}</a>` : '');
  function renderScenarioChoices() {
    const district = item.locationChoice ? location.value : 'all';
    const choices = getScenarioResources(topic, district);
    resultResources.innerHTML = choices.slice(0,3).map(r => `
      <article class="mini-resource"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.description)}</span>${r.hours ? `<p class="scenario-hours">活動時間：${escapeHtml(r.hours)}</p>` : ''}${resourceAddress(r)}${resourceActions(r)}${resourceDetails(r)}</article>
    `).join('');
    document.querySelector('#result-resource-count').textContent = choices.length ? `找到 ${choices.length} 筆相關資源，先列出 ${Math.min(3, choices.length)} 筆供查詢。` : '這個地區目前沒有列入名冊的資源，可改選其他地區。';
    const more = document.querySelector('#result-more');
    more.hidden = !item.catalog;
    if (item.catalog) {
      more.href = catalogUrl(item.catalog, district);
      more.textContent = `查看全部${choices.length}筆${item.catalog}`;
    }
  }
  location.onchange = renderScenarioChoices;
  renderScenarioChoices();
}

function renderResources() {
  const q = search.value.trim().toLowerCase();
  const filtered = resources.filter(r => {
    const matchesFilter = activeFilter === 'all' || (r.categories || [r.category]).includes(activeFilter);
    const district = r.district || '跨區服務';
    const matchesDistrict = activeDistrict === 'all' || district === activeDistrict;
    const haystack = `${r.title} ${r.description} ${r.category} ${district} ${r.address || ''} ${(r.aliases || []).join(' ')} ${(r.categories || []).join(' ')} ${r.serviceArea || ''} ${r.village || ''} ${r.vaccineNote || ''}`.toLowerCase();
    return matchesFilter && matchesDistrict && (!q || haystack.includes(q));
  });
  filtered.sort((a, b) => Number(Boolean(a.nameOnly)) - Number(Boolean(b.nameOnly)));
  const visible = filtered.slice(0, visibleCount);
  grid.innerHTML = visible.map(r => `
    <article class="resource-card ${r.id.startsWith('local-') ? '' : 'is-official'}" data-category="${r.category}">
      <div class="card-tags"><span class="tag">${escapeHtml(r.category)}</span>${(r.categories || []).includes('疫苗服務') ? '<span class="tag vaccine-tag">疫苗服務</span>' : ''}<span class="district-tag">${escapeHtml(r.district || '跨區服務')}</span></div>
      <h3>${escapeHtml(r.title)}</h3>
      <p>${escapeHtml(r.description)}</p>
      ${resourceAddress(r)}
      <div class="resource-meta">${resourceActions(r)}</div>
      ${resourceDetails(r)}
    </article>
  `).join('');
  noResults.hidden = filtered.length !== 0;
  resourceCount.textContent = filtered.length ? `共 ${filtered.length} 筆，現在顯示 ${visible.length} 筆` : '';
  loadMore.hidden = visible.length >= filtered.length;
}

document.querySelectorAll('button.scenario').forEach(button => button.addEventListener('click', () => {
  window.location.href = `result.html?topic=${encodeURIComponent(button.dataset.topic)}`;
}));
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  visibleCount = pageSize;
  renderResources();
}));
document.querySelectorAll('.district-filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.district-filter').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  activeDistrict = button.dataset.district;
  visibleCount = pageSize;
  renderResources();
}));
if (search && loadMore && grid) {
  search.addEventListener('input', () => {
    visibleCount = pageSize;
    renderResources();
  });
  loadMore.addEventListener('click', () => {
    visibleCount += pageSize;
    renderResources();
  });
  const params = new URLSearchParams(window.location.search);
  for (const [key, selector, field] of [['category','.filter','filter'],['district','.district-filter','district']]) {
    const value = params.get(key);
    const buttons = [...document.querySelectorAll(selector)];
    if (buttons.some(b => b.dataset[field] === value)) {
      buttons.forEach(b => b.classList.toggle('active', b.dataset[field] === value));
      if (key === 'category') activeFilter = value; else activeDistrict = value;
    }
  }
  renderResources();
}

function showBathingGuide() {
  const guide = document.querySelector('#bathing-guide');
  const sections = [...guide.querySelectorAll('[data-bathing-state]')];
  const restart = document.querySelector('#bathing-restart');
  document.querySelector('#result-intro').hidden = true;
  resultPanel.hidden = true;
  guide.hidden = false;
  document.title = '長輩洗澡需要人幫｜中西區照顧導航';

  function renderStep(moveFocus) {
    const answer = window.location.hash.slice(1);
    const current = sections.find(section => section.dataset.bathingState === answer) || sections[0];
    sections.forEach(section => { section.hidden = section !== current; });
    restart.hidden = current === sections[0];
    if (moveFocus) {
      window.scrollTo(0, 0);
      current.querySelector('h2').focus({ preventScroll: true });
    }
  }

  renderStep(false);
  window.addEventListener('hashchange', () => renderStep(true));
}

const requestedTopic = new URLSearchParams(window.location.search).get('topic');
if (resultPanel && requestedTopic === 'bathing') {
  showBathingGuide();
} else if (resultPanel) {
  const topic = Object.prototype.hasOwnProperty.call(scenarios, requestedTopic) ? requestedTopic : 'start';
  showScenario(topic);
  document.querySelector('#care-bathing-link').hidden = topic !== 'care';
  document.title = `${scenarios[topic].title}｜中西區照顧導航`;
}


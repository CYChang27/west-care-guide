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
    id: "red-cross", category: "照顧者", topics: ["rest"],
    title: "西區家庭照顧者服務窗口", description: "西區由臺中市家庭照顧者支持性服務單位承接。聯絡前可先準備目前照顧安排與最希望改善的問題。",
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
  }
];

const resources = [...baseResources, ...localResources];

const scenarios = {
  start: {
    title: "先把最困難的一件事說清楚，再選服務。",
    description: "當需求同時包含健康、照顧與家庭安排時，不必自己逐一查找單位。",
    steps: ["寫下目前最擔心的情況，以及希望先改善的一件事。", "聯絡中西區衛生所或1966，說明長者狀況、照顧安排與既有服務。", "確認下一步要聯絡誰、需要準備什麼資料。"]
  },
  care: {
    title: "先確認需要哪一類日常協助。",
    description: "長照服務可依評估結果提供居家、日照、交通、專業、輔具與其他生活支持。",
    steps: ["列出一天中最需要幫忙的時段與工作。", "撥打1966提出申請，或請衛生所協助說明。", "接受到府評估後，與個案管理員討論服務組合。"]
  },
  rest: {
    title: "照顧者的需要，也應列入照顧安排。",
    description: "可同時詢問長照喘息與家庭照顧者支持，不必等到無法負荷才求助。",
    steps: ["說明最近無法休息、無人替代或情緒壓力的具體情況。", "詢問1966喘息服務資格與可用額度。", "聯絡家庭照顧者支持單位，討論諮詢、技巧或情緒支持。"]
  },
  safety: {
    title: "先處理立即風險，再安排長期改善。",
    description: "跌倒、走失與居家危險需要分成緊急處理及後續環境改善。",
    steps: ["有立即危險時先撥119或110。", "記錄曾發生的時間、地點與當時狀況。", "向1966詢問輔具、居家無障礙或相關專業服務。"]
  },
  migrant: {
    title: "依問題選通譯、照護學習或權益諮詢。",
    description: "外籍看護遇到語言、照護技巧或工作生活問題時，可直接使用官方多國語資源。",
    steps: ["語言溝通或工作生活問題可先撥1955。", "照護技巧可使用勞動力發展署多國語教材。", "如長者照顧安排需調整，家屬仍應聯絡1966或衛生所討論服務。"]
  },
  health: {
    title: "新的健康變化，需要被醫療端知道。",
    description: "情緒、認知、行動、用藥或功能明顯改變時，請記錄實際情況並尋求評估。",
    steps: ["記下何時開始、發生頻率及對生活造成的影響。", "非緊急狀況可聯絡原就醫院所或衛生所討論。", "若影響日常照顧，同時向1966詢問可用生活支持。"]
  }
};

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
let visibleCount = 12;
const pageSize = 12;

function googleMapsDirectionsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving&dir_action=navigate`;
}

function resourceAddress(r) {
  if (!r.address) return '';
  const url = googleMapsDirectionsUrl(r.address);
  return `<a class="resource-address" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="使用 Google 地圖導航到 ${r.title}">
    <span class="resource-address-pin" aria-hidden="true">⌖</span>
    <span class="resource-address-text">${r.address}</span>
    <span class="resource-address-action">Google 導航</span>
  </a>`;
}

function resourceActions(r) {
  const phone = r.phone ? `<a class="action-link phone" href="${r.phoneHref}">撥打 ${r.phone}</a>` : '';
  const link = r.link ? `<a class="action-link web" href="${r.link}" target="_blank" rel="noopener">${r.action || '查看官方資訊'} →</a>` : '';
  return `<span class="action-row">${phone}${link}</span>`;
}

function showScenario(topic) {
  const item = scenarios[topic];
  resultPanel.dataset.topic = topic;
  resultTitle.textContent = item.title;
  resultDescription.textContent = item.description;
  resultSteps.innerHTML = item.steps.map(step => `<li>${step}</li>`).join('');
  resultResources.innerHTML = resources.filter(r => r.topics.includes(topic)).slice(0,3).map(r => `
    <article class="mini-resource"><strong>${r.title}</strong><span>${r.description}</span>${resourceAddress(r)}${resourceActions(r)}</article>
  `).join('');
}

function renderResources() {
  const q = search.value.trim().toLowerCase();
  const filtered = resources.filter(r => {
    const matchesFilter = activeFilter === 'all' || r.category === activeFilter;
    const haystack = `${r.title} ${r.description} ${r.category} ${r.address || ''}`.toLowerCase();
    return matchesFilter && (!q || haystack.includes(q));
  });
  const visible = filtered.slice(0, visibleCount);
  grid.innerHTML = visible.map(r => `
    <article class="resource-card ${r.id.startsWith('local-') ? '' : 'is-official'}" data-category="${r.category}">
      <span class="tag">${r.category}</span>
      <h3>${r.title}</h3>
      <p>${r.description}</p>
      ${resourceAddress(r)}
      <div class="resource-meta">${resourceActions(r)}</div>
    </article>
  `).join('');
  noResults.hidden = filtered.length !== 0;
  resourceCount.textContent = filtered.length ? `共 ${filtered.length} 筆，現在顯示 ${visible.length} 筆` : '';
  loadMore.hidden = visible.length >= filtered.length;
}

document.querySelectorAll('.scenario').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.scenario').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  showScenario(button.dataset.topic);
}));
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  visibleCount = pageSize;
  renderResources();
}));
search.addEventListener('input', () => {
  visibleCount = pageSize;
  renderResources();
});
loadMore.addEventListener('click', () => {
  visibleCount += pageSize;
  renderResources();
});

showScenario('start');
renderResources();

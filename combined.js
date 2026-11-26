const combinedForm = document.querySelector('#combined-form');
const careStatus = document.querySelector('#combined-status');
const combinedResults = document.querySelector('#combined-results');
const combinedCards = document.querySelector('#combined-cards');
const combinedError = document.querySelector('#combined-error');

const contactHealthCenter = {text: '撥打中西區衛生所 04-2222-3811', href: 'tel:0422223811'};
const contactLtc = {text: '撥打長照專線 1966', href: 'tel:1966'};

const needLabels = {
  care:'日常照顧', rest:'休息與替手', health:'健康與就醫', safety:'生活安全',
  welfare:'補助與物資', migrant:'外籍看護協助', vaccine:'疫苗接種',
  assistive:'輔具與居家改善', transport:'交通接送', community:'活動、共餐與課程'
};
const scenarioLink = (topic, text) => ({text, href:`result.html?topic=${topic}`});

function buildCarePlan(needs, status) {
  const has = key => needs.includes(key);
  const plans = [];
  if (has('health')) plans.push({
    key:'health', title:'先向原就醫院所說明最近的變化',
    detail:'準備症狀開始時間、用藥變化與原定回診日期。若同時想接種疫苗，也請向醫療人員說明目前的健康情形。',
    script:'家人最近的健康或用藥狀況有變化，想詢問是否需要提早回診、要帶哪些資料。',
    contact:contactHealthCenter, secondaryContact:true,
    contactHint:'沒有固定就醫院所或不知道找誰時，可先詢問衛生所。'
  });
  if (has('vaccine')) plans.push({
    key:'vaccine', title:'先確認接種院所、疫苗與時間',
    detail:'向接種院所確認適用對象、供應、費用及預約。'+(has('transport')?'把確認後的地點與時間提供給接送窗口，並確認該次行程是否符合接送用途。':''),
    script:'我想接種疫苗，請問目前有提供嗎？需要預約或帶什麼資料？'+(has('transport')?'我還需要安排接送，想先確認接種地點與時間。':''),
    contact:scenarioLink('vaccine','查看接種院所與聯絡方式')
  });

  const careNeeds=['care','rest','safety','assistive','transport'].filter(has);
  const groupCare=has('care')||has('rest');
  if (groupCare) {
    const concerns={care:'洗澡、備餐等日常照顧需要幫忙',rest:'需要有人暫時接手照顧',safety:'擔心跌倒或移動安全',assistive:'想評估輔具或居家環境',transport:'需要就醫或復健接送'};
    const concernText=careNeeds.map(k=>concerns[k]).join('，也');
    const routes={
      existing:{title:'請原長照個管員一起檢視服務安排', detail:'將這些需求在同一次諮詢說明，確認可調整的服務、時段及評估程序。',script:'家人目前已有使用長照，現在'+concernText+'，想請您一起評估怎麼調整。',contact:contactHealthCenter,secondaryContact:true,contactHint:'優先聯絡原個管員；找不到聯絡方式時，可詢問衛生所。'},
      new:{title:'撥1966，合併說明照顧與生活協助需求',detail:'說明家裡目前的照顧安排，由照管人員評估服務資格與適合的協助。',script:'家人目前沒有使用長照，現在'+concernText+'，想詢問評估與申請方式。',contact:contactLtc},
      unknown:{title:'先確認家裡目前的長照聯絡窗口',detail:'準備已有服務單位名稱或手邊資料，請衛生所協助確認該聯絡誰。',script:'家人現在'+concernText+'，我不確定目前用的是不是長照，想確認聯絡窗口。',contact:contactHealthCenter}
    };
    const plan={key:'care',...(routes[status]||routes.unknown),links:[]};
    if (has('assistive')) {
      plan.detail+=' 想申請輔具補助，請先確認評估與核定程序，再購買、租賃或施工。';
      plan.links.push(scenarioLink('assistive','查看輔具評估與諮詢窗口'));
    }
    if (has('transport')) {
      plan.detail+=' 交通接送與陪同看診需分別確認；'+(has('vaccine')?'提供接種院所與預約時間，並確認行程是否符合接送用途。':'準備去回程地點、時間與輪椅使用情形。');
      plan.links.push(scenarioLink('transport','查看接送方式與復康巴士窗口'));
    }
    if (has('assistive')&&has('welfare')) {
      plan.detail+=' 同時說明費用負擔，請窗口確認適用的輔具補助；若另有生活物資或其他福利需要，可查社福便利站。';
      plan.links.push({text:'查詢其他生活福利',href:catalogUrl('社會福利')});
    }
    plans.push(plan);
  } else {
    if (has('assistive')) plans.push({
      key:'assistive',title:has('welfare')?'把輔具需求與費用問題一起詢問':'先確認適合的輔具與評估方式',
      detail:'向輔具中心說明移動、洗澡或上下樓的困難，詢問評估與租借。'+(has('welfare')?'也請確認適用補助、申請窗口及自付費用；先完成所需評估與核定，再購買或施工。':'需要補助時，先確認申請與核定程序，再購買或施工。'),
      script:'家人生活中需要輔具協助，想知道要怎麼評估、能否租借'+(has('welfare')?'，以及有哪些補助與自付費用。':'。'),
      contact:scenarioLink('assistive','查看輔具中心與申請資訊'),
      links:has('welfare')?[{text:'另外查詢生活物資與福利',href:catalogUrl('社會福利')}]:[]
    });
    if (has('safety')&&!has('assistive')) plans.push({
      key:'safety',title:'說明最容易發生危險的地方',detail:'例如浴室、家門口或外出途中；已有長照個管員者，可請原個管員討論居家安全與可用協助。',contact:scenarioLink('safety','查看安全協助與聯絡窗口')
    });
    if (has('transport')) plans.push({
      key:'transport',title:has('vaccine')?'再確認接送資格與去回程':'確認這一趟可以使用哪種接送',
      detail:(has('vaccine')?'提供已確認的接種地點與時間。':'準備就醫或復健的日期、地點與去回程時間。')+'長照交通可向原個管員或1966詢問；符合復康巴士服務條件者可洽第五區。請先確認此次行程的用途、輪椅及上下樓安排；陪同看診另行確認。',
      script:'家人需要接送，想確認乘車資格、這趟行程能否安排，以及費用與回程怎麼預約。',
      contact:scenarioLink('transport','查看接送方式與聯絡窗口')
    });
  }
  if (has('community')) plans.push({
    key:'community',title:'確認據點活動與到達方式',
    detail:'查找附近據點，詢問活動、共餐、課程及報名方式。'+(has('rest')?'若希望有人替手，仍要另外確認照顧服務與時段；參加社區活動不等於已安排替代照顧。':'')+(has('transport')?'也請向據點詢問交通或陪同協助；長照接送與復康巴士是否適用這次活動，須另向窗口確認。':''),
    contact:scenarioLink('community','查看據點、活動時間與電話')
  });
  if (has('welfare')&&!has('assistive')) plans.push({
    key:'welfare',title:'確認補助或物資的申請方式',detail:'先說清楚是照顧費用、生活物資，或其他家庭支持需要，再確認服務對象、應備資料與申請窗口。',contact:{text:'開啟臺中市社福便利站',href:'https://i-welfare.taichung.gov.tw/people/index'}
  });
  if (has('migrant')) plans.push({
    key:'migrant',title:'依需要查通譯或照護教材',detail:'語言溝通、聘僱或勞動問題可洽1955；照護技巧可查多國語教材。若也需要輔具或調整照顧安排，家屬與實際照顧者可一起向原服務窗口說明。',contact:{text:'撥打移工專線 1955',href:'tel:1955'},extra:{text:'查看多國語照護教材',href:'https://fw.wda.gov.tw/wda-employer/home/textbook'}
  });
  return plans;
}

function element(tag, label, className) {
  const node = document.createElement(tag);
  if (label) node.textContent = label;
  if (className) node.className = className;
  return node;
}

function contactLink(contact, secondary) {
  const link = element('a', contact.text, secondary ? 'bathing-help' : 'bathing-action');
  link.href = contact.href;
  return link;
}

function updateCareStatus() {
  const selected = new FormData(combinedForm).getAll('need');
  careStatus.hidden = !selected.some(key => key === 'care' || key === 'rest');
  combinedError.hidden = true;
}

combinedForm.addEventListener('change', updateCareStatus);
combinedForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(combinedForm);
  const needs = data.getAll('need');
  if (needs.length < 2) {
    combinedError.hidden = false;
    return;
  }
  const plans = buildCarePlan(needs, data.get('care-status'));
  document.querySelector('#combined-summary').textContent = '你選擇：' + needs.map(key => needLabels[key]).join('、') + '。';
  const cards = plans.map((plan, index) => {
    const card = element('article', '', 'bathing-card');
    card.append(element('p', index === 0 ? '建議先確認' : '接著確認', 'bathing-label'),
      element('h3', plan.title), element('p', plan.detail));
    if (plan.script) {
      const script = element('p', '', 'bathing-script');
      script.append(element('strong', '聯絡時可以這樣說'), document.createTextNode('「' + plan.script + '」'));
      card.append(script);
    }
    if (plan.contactHint) card.append(element('p', plan.contactHint));
    card.append(contactLink(plan.contact, plan.secondaryContact));
    if (plan.extra) card.append(contactLink(plan.extra, true));
    if (plan.links?.length) {
      const links = element('div', '', 'combined-card-links');
      plan.links.forEach(link => links.append(contactLink(link, true)));
      card.append(links);
    }
    return card;
  });
  combinedCards.replaceChildren(...cards);
  combinedForm.hidden = true;
  combinedResults.hidden = false;
  document.querySelector('#combined-results-title').focus();
});

document.querySelector('#combined-edit').addEventListener('click', () => {
  combinedResults.hidden = true;
  combinedForm.hidden = false;
  combinedForm.querySelector('input[name="need"]').focus();
});
updateCareStatus();


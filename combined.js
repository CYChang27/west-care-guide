const combinedForm = document.querySelector('#combined-form');
const careStatus = document.querySelector('#combined-status');
const combinedResults = document.querySelector('#combined-results');
const combinedCards = document.querySelector('#combined-cards');
const combinedError = document.querySelector('#combined-error');

const contactHealthCenter = {text: '撥打中西區衛生所 04-2222-3811', href: 'tel:0422223811'};
const contactLtc = {text: '撥打長照專線 1966', href: 'tel:1966'};

function buildCarePlan(needs, status) {
  const has = key => needs.includes(key);
  const plans = [];
  if (has('health')) {
    plans.push({
      title: '聯絡原就醫院所，說清楚最近的變化',
      detail: '準備最近的症狀、用藥變化或未能完成的回診。如果沒有固定看診的地方，可先向衛生所詢問。',
      script: '長輩最近的健康或用藥狀況有變化，想詢問是否需要提早回診、要帶哪些資料。',
      contact: contactHealthCenter,
      secondaryContact: true
    });
  }
  const careNeeds = ['care', 'rest', 'safety'].filter(has);
  if (careNeeds.length) {
    const concerns = {
      care: '洗澡、備餐等日常照顧需要幫忙',
      rest: '需要有人暫時接手照顧',
      safety: '擔心長輩跌倒或移動不安全'
    };
    const requests = {
      care: '居家照顧',
      rest: '喘息或替代照顧',
      safety: '輔具、居家安全或外出協助'
    };
    const concernText = careNeeds.map(key => concerns[key]).join('，也');
    const requestText = careNeeds.map(key => requests[key]).join('、');
    if (has('care') || has('rest')) {
      const sameContact = careNeeds.length > 1 ? '這幾件事可以在同一次諮詢一起說。' : '';
      const routes = {
        existing: {
          title: '請原長照個管員檢視現有服務',
          detail: sameContact + '請對方確認現有服務能否調整，以及可用的時段。',
          script: '長輩目前已有使用長照，現在' + concernText + '。想請您一起評估' + requestText + '。',
          contact: contactHealthCenter,
          secondaryContact: true,
          contactHint: '找不到原個管員時，可先詢問衛生所。'
        },
        new: {
          title: '撥1966，洽詢長照評估',
          detail: sameContact + '說明家裡目前的照顧安排，請照管人員評估合適的服務。',
          script: '長輩目前沒有使用長照，現在' + concernText + '。想問怎麼申請評估，以及是否能安排' + requestText + '。',
          contact: contactLtc
        },
        unknown: {
          title: '先請衛生所協助確認長照窗口',
          detail: sameContact + '若手邊有服務單位名稱或照顧服務資料，可以一併告知。',
          script: '長輩現在' + concernText + '。我不確定目前用的是不是長照，想請問哪個窗口能協助。',
          contact: contactHealthCenter
        }
      };
      plans.push(routes[status] || routes.unknown);
    } else {
      plans.push({
        title: '聯絡衛生所詢問安全評估與可用協助',
        detail: '先說最容易發生危險的地方，例如浴室、家門口或外出途中。若長輩已有長照個管員，也可直接向原個管員反映。',
        script: '我們擔心長輩在家中或外出時不安全，想詢問適合的評估與可用的協助。',
        contact: contactHealthCenter
      });
    }
  }
  if (has('welfare')) {
    plans.push({
      title: '向福利窗口確認補助或物資',
      detail: '先說清楚缺的是照顧費用、生活物資，還是其他家庭支持；可透過臺中市社福便利站查詢適用服務。',
      contact: {text: '開啟臺中市社福便利站', href: 'https://i-welfare.taichung.gov.tw/people/index'}
    });
  }
  if (has('migrant')) {
    plans.push({
      title: '依需要查通譯或照護教材',
      detail: '語言溝通、聘僱或勞動問題可洽1955；需要照護技巧時，可查閱多國語教材。涉及長輩健康或服務調整，可一併告知原照顧或醫療窗口。',
      contact: {text: '撥打移工專線 1955', href: 'tel:1955'},
      extra: {text: '查看多國語照護教材', href: 'https://fw.wda.gov.tw/wda-employer/home/textbook'}
    });
  }
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
  const cards = plans.map((plan, index) => {
    const card = element('article', '', 'bathing-card');
    card.append(element('p', index === 0 ? '建議先做' : '也可另外處理', 'bathing-label'),
      element('h3', plan.title), element('p', plan.detail));
    if (plan.script) {
      const script = element('p', '', 'bathing-script');
      script.append(element('strong', '聯絡時可以這樣說'), document.createTextNode('「' + plan.script + '」'));
      card.append(script);
    }
    if (plan.contactHint) card.append(element('p', plan.contactHint));
    card.append(contactLink(plan.contact, plan.secondaryContact));
    if (plan.extra) card.append(contactLink(plan.extra, true));
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

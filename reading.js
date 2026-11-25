(function setupReadingControls() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const preferences = [['standard','標準'],['large','大字'],['extra','特大字'],['max','最大字']];
  const label = document.createElement('label');
  label.className = 'text-size-control';
  const labelText = document.createElement('span');
  labelText.textContent = '文字大小';
  const select = document.createElement('select');
  for (const [value, text] of preferences) select.add(new Option(text, value));
  label.append(labelText, select);
  const wrapper = document.createElement('div');
  wrapper.className = 'reading-tools';
  wrapper.append(label);
  header.after(wrapper);

  let saved;
  try { saved = localStorage.getItem('zhongxi-text-size'); } catch {}
  if (preferences.some(([value]) => value === saved)) select.value = saved;
  function applySize() {
    document.documentElement.dataset.readingSize = select.value;
  }
  applySize();
  select.addEventListener('change', () => {
    applySize();
    try { localStorage.setItem('zhongxi-text-size', select.value); } catch {}
  });
})();

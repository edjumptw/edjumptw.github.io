'use strict';
const form = document.querySelector('#registration');
const key = 'jump-mom-finance-registration-v2';
form.addEventListener('submit', event => {
  event.preventDefault();
  const error = document.querySelector('#error');
  error.textContent = '';
  const lines = ['已報名媽媽理財課（待行政收件確認）', '介紹人：Jump（陳執董團隊）', '公告時間：2026/12/3、12/4 09:30–13:30；由Jump 團隊專屬窗口（官方 LINE @jvs3260l）一對一聯繫協助資格確認與引導', '填寫時間：' + new Date().toISOString()];
  for (const group of form.querySelectorAll('fieldset')) {
    const inputs = [...group.querySelectorAll('[name]')];
    let values = inputs.filter(input => !['checkbox', 'radio'].includes(input.type) || input.checked).map(input => input.value.trim());
    if (group.querySelector('small')?.textContent.includes('必填') && !values.length) {
      error.textContent = '請填寫：' + group.dataset.title;
      inputs[0].focus();
      return;
    }
    if (group.dataset.title === '邀請人') values = ['Jump'];
    if (values.includes('__other__')) {
      const other = group.querySelector('[data-other]');
      if (!other.value.trim()) { error.textContent = '請填寫其他內容：' + group.dataset.title; other.focus(); return; }
      values = values.map(value => value === '__other__' ? '其他：' + other.value.trim() : value);
    }
    lines.push(group.dataset.title + '：' + values.join('、'));
  }
  lines.push('個資使用同意：是；用途：本次報名、聯絡、補助資格與推薦分潤對帳。');
  const card = lines.join('\n');
  document.querySelector('#card').value = card;
  let status = '資料卡已產生；請私訊Jump 團隊專屬窗口（官方 LINE @jvs3260l）完成交件與資格確認。';
  try {
    if (document.querySelector('#backup').checked) {
      localStorage.setItem(key, JSON.stringify({card, createdAt: new Date().toISOString()}));
      status += ' 已在此裝置儲存備份。';
    } else { localStorage.removeItem(key); }
  } catch { status += ' 此裝置無法儲存備份，請立即複製資料卡。'; }
  document.querySelector('#save-status').textContent = status;
  document.querySelector('#result').hidden = false;
  document.querySelector('#result').scrollIntoView({behavior: 'smooth'});
});
document.querySelector('#copy').addEventListener('click', async () => {
  const card = document.querySelector('#card');
  try { await navigator.clipboard.writeText(card.value); document.querySelector('#copy-status').textContent = '已複製。請到官方帳號私訊貼上完整資料卡，等待Jump 團隊專屬窗口（官方 LINE @jvs3260l）一對一聯繫確認。'; }
  catch { card.focus(); card.select(); document.querySelector('#copy-status').textContent = '請長按或使用 Ctrl/Cmd+C 複製已選取的資料卡。'; }
});
document.querySelector('#clear').addEventListener('click', () => {
  try { localStorage.removeItem(key); } catch {}
  form.reset(); document.querySelector('#card').value = ''; document.querySelector('#result').hidden = true;
  document.querySelector('#error').textContent = '已清除本機備份與本頁填寫資料。';
});
try {
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  if (saved?.card) {
    document.querySelector('#card').value = saved.card;
    document.querySelector('#result').hidden = false;
    document.querySelector('#save-status').textContent = '已還原此裝置的資料卡備份；請確認是否已私訊行政，避免重複交件。';
  }
} catch {}

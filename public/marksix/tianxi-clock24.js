/* 出生時刻用 24 小時選擇：日期 + 00–23 + 分。唔用 iOS 上午／下午轉輪。 */
(function (global) {
  'use strict';
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fillSelect(el, from, to) {
    if (!el || el.options.length) return;
    var html = '';
    for (var i = from; i <= to; i++) html += '<option value="' + pad2(i) + '">' + pad2(i) + '</option>';
    el.innerHTML = html;
  }
  function syncPersonalDT() {
    var hidden = document.getElementById('personalDT');
    var dateEl = document.getElementById('personalDate');
    var hourEl = document.getElementById('personalHour');
    var minEl = document.getElementById('personalMin');
    var wrap = document.getElementById('personalDTWrap');
    if (!hidden || !dateEl || !hourEl || !minEl) return;
    if (!dateEl.value) {
      hidden.value = '';
      if (wrap) wrap.classList.remove('has-val');
      return;
    }
    hidden.value = dateEl.value + 'T' + hourEl.value + ':' + minEl.value;
    if (wrap) wrap.classList.add('has-val');
    try { hidden.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
  }
  function injectCss() {
    if (document.getElementById('tx-clock24-css')) return;
    var st = document.createElement('style');
    st.id = 'tx-clock24-css';
    st.textContent = '.m6-clock24{display:grid;grid-template-columns:minmax(0,1.6fr) 72px 12px 72px;align-items:center;gap:6px;height:auto;overflow:visible}' +
      '.m6-ops .m6-clock24 input[type=date],.m6-ops .m6-clock24 select{position:static;inset:auto;display:block;width:100%;height:52px;min-height:52px;max-height:52px;margin:0;padding:0 10px;border:1px solid var(--rule);border-radius:12px;font-size:15px;font-weight:600;line-height:52px;text-align:center;background:var(--paper);color:var(--ink);box-sizing:border-box;-webkit-appearance:none;appearance:none}' +
      '.m6-ops .m6-clock24 select{padding:0 22px 0 8px}' +
      '.m6-clock-colon{text-align:center;font-weight:800;font-size:18px;color:var(--ink-mute)}';
    document.head.appendChild(st);
  }
  function installClock24() {
    var wrap = document.getElementById('personalDTWrap');
    if (!wrap) return;
    injectCss();
    var lab = document.querySelector('label.m6-ops-lab[for="personalDT"], label.m6-ops-lab[for="personalDate"]');
    if (lab) {
      lab.textContent = '個人出生資料';
      lab.setAttribute('for', 'personalDate');
    }
    if (!document.getElementById('personalDate') || !document.getElementById('personalHour')) {
      var old = document.getElementById('personalDT');
      var prev = old && old.value ? old.value : '';
      wrap.classList.remove('m6-dt');
      wrap.classList.add('m6-clock24');
      wrap.innerHTML = '<input type="hidden" id="personalDT" autocomplete="off">' +
        '<input type="date" id="personalDate" aria-label="出生日期">' +
        '<select id="personalHour" aria-label="時"></select>' +
        '<span class="m6-clock-colon">:</span>' +
        '<select id="personalMin" aria-label="分"></select>';
      var m = String(prev).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):?(\d{2})?/);
      if (m) {
        document.getElementById('personalDate').value = m[1];
        document.getElementById('personalHour').setAttribute('data-init', m[2]);
        document.getElementById('personalMin').setAttribute('data-init', m[3] || '00');
      }
    }
    var dateEl = document.getElementById('personalDate');
    var hourEl = document.getElementById('personalHour');
    var minEl = document.getElementById('personalMin');
    fillSelect(hourEl, 0, 23);
    fillSelect(minEl, 0, 59);
    hourEl.value = hourEl.getAttribute('data-init') || hourEl.value || '12';
    minEl.value = minEl.getAttribute('data-init') || minEl.value || '00';
    if (!hourEl.value) hourEl.value = '12';
    if (!minEl.value) minEl.value = '00';
    ['change', 'input'].forEach(function (ev) {
      dateEl.addEventListener(ev, syncPersonalDT);
      hourEl.addEventListener(ev, syncPersonalDT);
      minEl.addEventListener(ev, syncPersonalDT);
    });
    wrap.classList.add('m6-clock24');
    wrap.setAttribute('data-clock24', '1');
    syncPersonalDT();
  }
  // 舊版 DOM 有機會被外層重新渲染而清空選項，持續自我修復
  function ensureClock24() {
    var hourEl = document.getElementById('personalHour');
    var minEl = document.getElementById('personalMin');
    var wrap = document.getElementById('personalDTWrap');
    if (!wrap) return;
    if (!hourEl || !minEl || !hourEl.options.length || !minEl.options.length) installClock24();
  }
  function watch() {
    ensureClock24();
    var wrap = document.getElementById('personalDTWrap');
    if (wrap && global.MutationObserver && !wrap.getAttribute('data-clock24-watch')) {
      wrap.setAttribute('data-clock24-watch', '1');
      new MutationObserver(function () { ensureClock24(); }).observe(wrap, { childList: true });
    }
    if (wrap && wrap.parentNode && global.MutationObserver && !wrap.parentNode.getAttribute('data-clock24-watch')) {
      wrap.parentNode.setAttribute('data-clock24-watch', '1');
      new MutationObserver(function () { setTimeout(ensureClock24, 0); }).observe(wrap.parentNode, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch, { once: true });
  else watch();
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    ensureClock24();
    watch();
    if (tries > 40) clearInterval(timer);
  }, 500);
  global.TXInstallClock24 = installClock24;
})(typeof window !== 'undefined' ? window : globalThis);

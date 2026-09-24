/* Lai's Family Korea 2026 voyage upgrade */
(function () {
  function injectPhoneCss() {
    if (document.getElementById('voyage-phone-css')) return;
    var s = document.createElement('style');
    s.id = 'voyage-phone-css';
    s.textContent = [
      '@media (max-width: 900px){',
      '.header-top-ribbon{display:none!important}',
      '.header-main-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:calc(8px + env(safe-area-inset-top,0px)) 10px 8px!important}',
      '.header-brand-group{min-width:0;flex:1 1 auto;display:flex!important;align-items:center!important;gap:8px!important}',
      '.header-title-box{min-width:0;flex:1}',
      '.header-site-title{font-size:15px!important;line-height:1.2!important;letter-spacing:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:42vw!important}',
      '.header-site-subtitle{display:none!important}',
      '.header-action-group{display:flex!important;flex:0 0 auto;gap:4px!important}',
      '.btn-theme-pill{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;padding:0!important;justify-content:center!important;border-radius:12px!important}',
      '.header-action-group .theme-label{display:none!important}',
      '.header-avatar-frame,.header-avatar-img{width:36px!important;height:36px!important}',
      '.editorial-nav-dock{display:none!important}',
      '.hero-cover-cities{display:none!important}',
      '.hero-cover-card{height:260px!important}',
      '.main-hero-title{font-size:1.35rem!important;letter-spacing:0!important}',
      '.countdown-bar{display:flex!important;flex-direction:column!important;gap:10px!important}',
      '.countdown-timer-boxes{display:grid!important;grid-template-columns:repeat(4,1fr)!important;width:100%}',
      '.mobile-bottom-nav{padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))!important}',
      '.app-main,main{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}',
      '.voyage-ribbon-grid{grid-template-columns:1fr 1fr!important}',
      '.vr-chip{min-height:0!important}',
      '}',
      '@media (max-width:560px){.voyage-ribbon-grid{grid-template-columns:1fr!important}}'
    ].join('');
    document.head.appendChild(s);
  }
  function compactHeaderTitle() {
    var el = document.querySelector('.header-site-title');
    if (!el) return;
    if (window.innerWidth <= 900) el.textContent = "Lai's Korea 2026";
  }

  const TRIP_START = new Date('2026-10-16T00:00:00+09:00');
  const TRIP_END = new Date('2026-10-24T23:59:59+09:00');
  const NOTE_KEY = 'korea_trip_day_notes_v1';
  function pad2(n) { return String(n).padStart(2, '0'); }
  function formatClock(date, tz) {
    try {
      return new Intl.DateTimeFormat('zh-HK', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, weekday: 'short', month: 'numeric', day: 'numeric'
      }).format(date);
    } catch (e) {
      return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    }
  }
  function tickClocks() {
    const now = new Date();
    const hkt = document.getElementById('clockHkt');
    const kst = document.getElementById('clockKst');
    if (hkt) hkt.textContent = formatClock(now, 'Asia/Hong_Kong');
    if (kst) kst.textContent = formatClock(now, 'Asia/Seoul');
  }
  function getTripDayNumber(now) {
    const n = now || new Date();
    if (n < TRIP_START) return 0;
    if (n > TRIP_END) return 10;
    return Math.floor((n.getTime() - TRIP_START.getTime()) / 86400000) + 1;
  }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); }
  window.jumpToToday = function () {
    const day = getTripDayNumber(new Date());
    if (day >= 1 && day <= 9 && typeof openDay === 'function') {
      openDay(day); toast('opened day ' + day);
    } else if (typeof showView === 'function') {
      showView('index');
    }
  };
  function wxIcon(code) {
    if (code === 0) return 'sun';
    if (code <= 3) return 'cloud';
    if (code <= 67) return 'rain';
    return 'storm';
  }
  async function loadLiveWeather() {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.57,33.50&longitude=126.98,126.53&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul');
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [data];
      const seoul = rows[0];
      const jeju = rows[1] || rows[0];
      const sEl = document.getElementById('wxSeoul');
      const jEl = document.getElementById('wxJeju');
      if (sEl && seoul && seoul.current) sEl.textContent = Math.round(seoul.current.temperature_2m) + 'C';
      if (jEl && jeju && jeju.current) jEl.textContent = Math.round(jeju.current.temperature_2m) + 'C';
    } catch (err) {}
  }
  function applyFxRate(krwPerHkd) {
    if (!krwPerHkd || !isFinite(krwPerHkd) || krwPerHkd < 100) return;
    try { if (typeof KRW_TO_HKD_RATE !== 'undefined') KRW_TO_HKD_RATE = 1 / krwPerHkd; } catch (e) {}
    const pretty = Math.round(krwPerHkd);
    const ribbon = document.getElementById('fxRibbonRate');
    if (ribbon) ribbon.textContent = '1 HKD ~ ' + pretty + ' KRW';
    const title = document.querySelector('.cheatsheet-title span');
    if (title) title.textContent = 'FX 1 HKD ~ ' + pretty + ' KRW';
  }
  async function loadLiveFx() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/HKD');
      const data = await res.json();
      if (data && data.rates && data.rates.KRW) applyFxRate(data.rates.KRW);
    } catch (err) {}
  }
  function loadDayNote(num) {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}')[String(num)] || ''; }
    catch (e) { return ''; }
  }
  window.saveDayNote = function (num, val) {
    try {
      const all = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}');
      all[String(num)] = val;
      localStorage.setItem(NOTE_KEY, JSON.stringify(all));
    } catch (e) {}
  };
  function daySummaryText(num) {
    const days = window.allDaysData || [];
    const d = days.find(item => item.num === num);
    if (!d) return '';
    const lines = ["Lai's Family Korea 2026 Day " + d.num, d.date + ' | ' + d.region, d.title, d.highlight];
    (d.events || []).forEach(ev => {
      if (ev.transit) lines.push(ev.transit);
      else lines.push((ev.time || '') + ' ' + (ev.title || ''));
    });
    return lines.join('\n');
  }
  window.copyDaySummary = function (num) {
    if (typeof copyValue === 'function') copyValue(daySummaryText(num), 'copied');
  };
  window.shareDay = function (num) {
    const text = daySummaryText(num);
    if (navigator.share) navigator.share({ title: 'Korea Trip Day ' + num, text: text }).catch(() => window.copyDaySummary(num));
    else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };
  function buildSearchIndex() {
    const items = [];
    const days = window.allDaysData || [];
    days.forEach(d => {
      items.push({ label: 'DAY ' + d.num + ' | ' + d.title, hint: d.region, hay: (d.title + d.region + d.highlight + d.date).toLowerCase(), go: () => openDay(d.num) });
      (d.events || []).forEach(ev => {
        if (!ev.title) return;
        items.push({ label: ev.title, hint: 'Day ' + d.num, hay: ((ev.title||'')+(ev.hangul||'')+(ev.desc||'')).toLowerCase(), go: () => openDay(d.num) });
      });
    });
    items.push({ label: 'Treasury', hint: 'FX', hay: 'money fx krw', go: () => showView('money') });
    items.push({ label: 'Transit', hint: 'flights', hay: 'flight car hotel', go: () => showView('transit') });
    items.push({ label: 'Food', hint: 'bars', hay: 'food bar pork coffee', go: () => showView('food') });
    items.push({ label: 'Packing', hint: 'list', hay: 'passport adapter', go: () => showView('packing') });
    items.push({ label: 'Phrases', hint: 'korean', hay: 'korean toilet', go: () => showView('phrases') });
    return items;
  }
  let SEARCH_INDEX = null;
  window.runOmnisearch = function (q) {
    const box = document.getElementById('omnisearchResults');
    if (!box) return;
    const query = (q || '').trim().toLowerCase();
    if (!SEARCH_INDEX) SEARCH_INDEX = buildSearchIndex();
    if (!query) { box.innerHTML = '<div class="omni-hint">Yeonnam / Udo / Staria / Bar Cham</div>'; return; }
    const hits = SEARCH_INDEX.filter(it => it.hay.includes(query) || it.label.toLowerCase().includes(query)).slice(0, 12);
    box.innerHTML = hits.map(it => '<button class="omni-item"><b>' + it.label + '</b><small>' + it.hint + '</small></button>').join('') || '<div class="omni-empty">No results</div>';
    box.querySelectorAll('.omni-item').forEach((btn, i) => btn.addEventListener('click', () => { closeSearchModal(); hits[i].go(); }));
  };
  window.openSearchModal = function () {
    const el = document.getElementById('searchOverlay');
    if (!el) return;
    el.classList.add('open');
    const input = document.getElementById('omnisearchInput');
    if (input) { input.value = ''; runOmnisearch(''); setTimeout(() => input.focus(), 50); }
  };
  window.closeSearchModal = function () { const el = document.getElementById('searchOverlay'); if (el) el.classList.remove('open'); };
  window.openSosSheet = function () { const el = document.getElementById('sosOverlay'); if (el) el.classList.add('open'); };
  window.closeSosSheet = function () { const el = document.getElementById('sosOverlay'); if (el) el.classList.remove('open'); };
  function injectHeaderButtons() {
    const group = document.querySelector('.header-action-group');
    if (!group || group.querySelector('[data-upgrade-btn]')) return;
    group.insertAdjacentHTML('afterbegin',
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="openSearchModal()"><span class="theme-icon">S</span></button>' +
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="jumpToToday()"><span class="theme-icon">T</span></button>' +
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="openSosSheet()"><span class="theme-icon">!</span></button>'
    );
  }
  function injectRibbon() {
    if (document.getElementById('voyageRibbon')) return;
    const metrics = document.querySelector('.trip-metrics-bar');
    if (!metrics) return;
    metrics.insertAdjacentHTML('afterend',
      '<div class="voyage-ribbon" id="voyageRibbon"><div class="voyage-ribbon-grid">' +
      '<div class="vr-chip"><span class="vr-kicker">HKT</span><span class="vr-value" id="clockHkt">--:--</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">KST</span><span class="vr-value" id="clockKst">--:--</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">FX</span><span class="vr-value" id="fxRibbonRate">1 HKD ~ 173 KRW</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">WEATHER</span><div class="vr-weather-row"><div>Seoul <span id="wxSeoul">...</span></div><div>Jeju <span id="wxJeju">...</span></div></div></div>' +
      '</div></div>'
    );
  }
  function injectOverlays() {
    if (document.getElementById('searchOverlay')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="overlay-sheet" id="searchOverlay" onclick="if(event.target===this)closeSearchModal()"><div class="overlay-panel"><div class="overlay-head"><h3>Search</h3><button class="overlay-close" onclick="closeSearchModal()">Close</button></div><input id="omnisearchInput" class="omni-input" oninput="runOmnisearch(this.value)"/><div id="omnisearchResults" class="omni-results"></div></div></div>' +
      '<div class="overlay-sheet" id="sosOverlay" onclick="if(event.target===this)closeSosSheet()"><div class="overlay-panel"><div class="overlay-head"><h3>Emergency</h3><button class="overlay-close" onclick="closeSosSheet()">Close</button></div><div class="sos-grid">' +
      '<a class="sos-card" href="tel:112"><b>112 Police</b></a><a class="sos-card" href="tel:119"><b>119 Fire</b></a>' +
      '<a class="sos-card" href="tel:1330"><b>1330 Tourist</b></a><a class="sos-card" href="tel:+82-10-3212-6215"><b>Seoul car</b></a>' +
      '<a class="sos-card" href="tel:1588-1230"><b>Jeju Lotte</b></a>' +
      '<button class="sos-card" onclick="copyValue(\'3410\',\'PIN\')"><b>PIN 3410</b></button></div></div></div>'
    );
  }
  function enhanceDayView() {
    if (typeof window.renderDayDetail !== 'function') return;
    const orig = window.renderDayDetail;
    window.renderDayDetail = function (num) {
      orig(num);
      compactHeaderTitle();
      const wrap = document.getElementById('dayDetailContainer');
      if (!wrap || wrap.querySelector('.day-note-box')) return;
      wrap.insertAdjacentHTML('beforeend', '<div class="day-tools"><button onclick="shareDay(' + num + ')">Share</button><button onclick="copyDaySummary(' + num + ')">Copy</button></div><div class="day-note-box"><textarea id="dayNoteField" oninput="saveDayNote(' + num + ', this.value)"></textarea></div>');
      const noteEl = document.getElementById('dayNoteField');
      if (noteEl) noteEl.value = loadDayNote(num);
    };
  }
  function boot() {
    injectPhoneCss();
    compactHeaderTitle();
    injectHeaderButtons();
    injectRibbon();
    injectOverlays();
    enhanceDayView();
    tickClocks();
    setInterval(tickClocks, 1000);
    loadLiveFx();
    loadLiveWeather();
    window.addEventListener('resize', compactHeaderTitle);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

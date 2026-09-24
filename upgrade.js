/* Lai's Family Korea 2026 voyage upgrade */
(function () {
  function injectPhoneCss() {
    if (document.getElementById('voyage-phone-css')) return;
    var s = document.createElement('style');
    s.id = 'voyage-phone-css';
    s.textContent = [
      'html{-webkit-text-size-adjust:100%;text-size-adjust:100%}',
      'button,a,input,textarea{touch-action:manipulation}',
      '@media (max-width:900px){',
      '.header-top-ribbon,.editorial-nav-dock,.header-site-subtitle,.header-tracking-label,.hero-cover-cities,.hero-cover-tag{display:none!important}',
      '.header-main-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px!important}',
      '.header-brand-group{min-width:0;flex:1;display:flex!important;align-items:center!important;gap:10px!important}',
      '.header-title-box{min-width:0;flex:1}',
      '.header-site-title{font-size:17px!important;line-height:1.2!important;letter-spacing:0!important;white-space:nowrap!important;font-weight:800!important}',
      '.header-avatar-frame,.header-avatar-img{width:34px!important;height:34px!important;border-radius:50%}',
      '.header-action-group{display:flex!important;gap:6px!important}',
      '.btn-theme-pill{width:42px!important;height:42px!important;min-width:42px!important;padding:0!important;border-radius:14px!important;justify-content:center}',
      '.header-action-group .theme-label,.btn-today-mobile{display:none!important}',
      '.main-hero-title{display:none!important}',
      '.hero-cover-card{height:220px!important;border-radius:16px}',
      '.hero-cover-sub{font-size:13px!important}',
      '.countdown-bar{display:flex!important;flex-direction:column!important;gap:8px!important;padding:14px!important}',
      '.countdown-label{font-size:13px!important}',
      '.countdown-sub{font-size:12px!important}',
      '.countdown-timer-boxes{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:6px!important;width:100%}',
      '.countdown-box{min-width:0!important;padding:10px 0!important}',
      '.countdown-num{font-size:20px!important}',
      '.trip-metrics-bar{display:flex!important;flex-direction:column!important;gap:8px!important}',
      '.metric-chip{padding:12px!important}',
      '.voyage-ribbon-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}',
      '.vr-chip{min-height:0!important;padding:10px!important}',
      '.vr-value{font-size:15px!important}',
      '.app-main,main{padding:12px 12px calc(100px + env(safe-area-inset-bottom,0px))!important}',
      '.mobile-bottom-nav{padding:6px 6px calc(8px + env(safe-area-inset-bottom,0px))!important}',
      '.bot-nav-btn{min-height:48px;font-size:11px}',
      '.day-pills-bar{display:flex!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch;gap:8px!important;padding:4px 0 10px}',
      '.day-poster-top-pills,.day-poster-badge,.day-weather-pill{white-space:normal!important;line-height:1.35!important}',
      '.event-card{padding:14px!important}',
      '.event-heading{font-size:17px!important}',
      '.event-actions-bar{display:flex!important;flex-wrap:wrap!important;gap:8px!important}',
      '.btn-act{min-height:44px;padding:10px 12px!important}',
      '}',
      '@media (max-width:560px){.voyage-ribbon-grid{grid-template-columns:1fr!important}}'
    ].join('');
    document.head.appendChild(s);
  }
  function compactHeaderTitle() {
    var el = document.querySelector('.header-site-title');
    if (el && window.innerWidth <= 900) el.textContent = '\u97d3\u570b\u884c\u7a0b';
  }
  const TRIP_START = new Date('2026-10-16T00:00:00+09:00');
  const TRIP_END = new Date('2026-10-24T23:59:59+09:00');
  const NOTE_KEY = 'korea_trip_day_notes_v1';
  function pad2(n) { return String(n).padStart(2, '0'); }
  function formatClock(date, tz) {
    try {
      return new Intl.DateTimeFormat('zh-HK', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, month: 'numeric', day: 'numeric' }).format(date);
    } catch (e) { return pad2(date.getHours()) + ':' + pad2(date.getMinutes()); }
  }
  function tickClocks() {
    var now = new Date();
    var hkt = document.getElementById('clockHkt');
    var kst = document.getElementById('clockKst');
    if (hkt) hkt.textContent = formatClock(now, 'Asia/Hong_Kong');
    if (kst) kst.textContent = formatClock(now, 'Asia/Seoul');
  }
  function getTripDayNumber(now) {
    var n = now || new Date();
    if (n < TRIP_START) return 0;
    if (n > TRIP_END) return 10;
    return Math.floor((n.getTime() - TRIP_START.getTime()) / 86400000) + 1;
  }
  window.jumpToToday = function () {
    var day = getTripDayNumber(new Date());
    if (day >= 1 && day <= 9 && typeof openDay === 'function') openDay(day);
    else if (typeof showView === 'function') showView('index');
  };
  async function loadLiveWeather() {
    try {
      var res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.57,33.50&longitude=126.98,126.53&current=temperature_2m&timezone=Asia%2FSeoul');
      var data = await res.json();
      var rows = Array.isArray(data) ? data : [data];
      var sEl = document.getElementById('wxSeoul');
      var jEl = document.getElementById('wxJeju');
      if (sEl && rows[0] && rows[0].current) sEl.textContent = Math.round(rows[0].current.temperature_2m) + '\u00b0C';
      if (jEl && rows[1] && rows[1].current) jEl.textContent = Math.round(rows[1].current.temperature_2m) + '\u00b0C';
    } catch (e) {}
  }
  async function loadLiveFx() {
    try {
      var res = await fetch('https://open.er-api.com/v6/latest/HKD');
      var data = await res.json();
      if (!data || !data.rates || !data.rates.KRW) return;
      var pretty = Math.round(data.rates.KRW);
      try { if (typeof KRW_TO_HKD_RATE !== 'undefined') KRW_TO_HKD_RATE = 1 / data.rates.KRW; } catch (e) {}
      var ribbon = document.getElementById('fxRibbonRate');
      if (ribbon) ribbon.textContent = '1 HKD \u2248 ' + pretty;
    } catch (e) {}
  }
  function loadDayNote(num) {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}')[String(num)] || ''; } catch (e) { return ''; }
  }
  window.saveDayNote = function (num, val) {
    try {
      var all = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}');
      all[String(num)] = val;
      localStorage.setItem(NOTE_KEY, JSON.stringify(all));
    } catch (e) {}
  };
  function daySummaryText(num) {
    var days = window.allDaysData || [];
    var d = days.find(function (item) { return item.num === num; });
    if (!d) return '';
    var lines = ['Korea 2026 Day ' + d.num, d.date + ' ' + d.region, d.title];
    (d.events || []).forEach(function (ev) {
      lines.push(ev.transit || ((ev.time || '') + ' ' + (ev.title || '')));
    });
    return lines.join('\n');
  }
  window.copyDaySummary = function (num) {
    if (typeof copyValue === 'function') copyValue(daySummaryText(num), 'copied');
  };
  window.shareDay = function (num) {
    var text = daySummaryText(num);
    if (navigator.share) navigator.share({ title: 'Day ' + num, text: text }).catch(function () { window.copyDaySummary(num); });
    else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };
  function buildSearchIndex() {
    var items = [];
    (window.allDaysData || []).forEach(function (d) {
      items.push({ label: 'DAY ' + d.num + ' ' + d.title, hint: d.region, hay: (d.title + d.region + d.highlight + d.date).toLowerCase(), go: function () { openDay(d.num); } });
      (d.events || []).forEach(function (ev) {
        if (!ev.title) return;
        items.push({ label: ev.title, hint: 'Day ' + d.num, hay: ((ev.title || '') + (ev.hangul || '') + (ev.desc || '')).toLowerCase(), go: function () { openDay(d.num); } });
      });
    });
    items.push({ label: '\u5206\u5e33 / \u532f\u7387', hint: '', hay: 'money fx krw hkd', go: function () { showView('money'); } });
    items.push({ label: '\u4ea4\u901a\u4f4f\u5bbf', hint: '', hay: 'flight car hotel', go: function () { showView('transit'); } });
    items.push({ label: '\u7f8e\u98df', hint: '', hay: 'food bar pork coffee', go: function () { showView('food'); } });
    items.push({ label: '\u884c\u674e', hint: '', hay: 'passport adapter packing', go: function () { showView('packing'); } });
    items.push({ label: '\u97d3\u8a9e\u5361', hint: '', hay: 'korean toilet phrase', go: function () { showView('phrases'); } });
    return items;
  }
  var SEARCH_INDEX = null;
  window.runOmnisearch = function (q) {
    var box = document.getElementById('omnisearchResults');
    if (!box) return;
    var query = (q || '').trim().toLowerCase();
    if (!SEARCH_INDEX) SEARCH_INDEX = buildSearchIndex();
    if (!query) { box.innerHTML = '<div class="omni-hint">\u8a66\u8a66\uff1a\u5ef6\u5357\u3001\u725b\u5cf6\u3001Staria\u3001\u9ed1\u8c6c</div>'; return; }
    var hits = SEARCH_INDEX.filter(function (it) { return it.hay.indexOf(query) >= 0 || it.label.toLowerCase().indexOf(query) >= 0; }).slice(0, 12);
    box.innerHTML = hits.map(function (it) { return '<button class="omni-item"><b>' + it.label + '</b><small>' + it.hint + '</small></button>'; }).join('') || '<div class="omni-empty">\u627e\u4e0d\u5230</div>';
    box.querySelectorAll('.omni-item').forEach(function (btn, i) {
      btn.addEventListener('click', function () { closeSearchModal(); hits[i].go(); });
    });
  };
  window.openSearchModal = function () {
    var el = document.getElementById('searchOverlay');
    if (!el) return;
    el.classList.add('open');
    var input = document.getElementById('omnisearchInput');
    if (input) { input.value = ''; runOmnisearch(''); setTimeout(function () { input.focus(); }, 50); }
  };
  window.closeSearchModal = function () { var el = document.getElementById('searchOverlay'); if (el) el.classList.remove('open'); };
  window.openSosSheet = function () { var el = document.getElementById('sosOverlay'); if (el) el.classList.add('open'); };
  window.closeSosSheet = function () { var el = document.getElementById('sosOverlay'); if (el) el.classList.remove('open'); };
  function injectHeaderButtons() {
    var group = document.querySelector('.header-action-group');
    if (!group || group.querySelector('[data-upgrade-btn]')) return;
    group.insertAdjacentHTML('afterbegin',
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="openSearchModal()" title="\u641c\u5c0b"><span class="theme-icon">\ud83d\udd0d</span></button>' +
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="openSosSheet()" title="\u7dca\u6025"><span class="theme-icon">\ud83c\udd98</span></button>'
    );
  }
  function injectRibbon() {
    if (document.getElementById('voyageRibbon')) return;
    var metrics = document.querySelector('.trip-metrics-bar');
    if (!metrics) return;
    metrics.insertAdjacentHTML('afterend',
      '<div class="voyage-ribbon" id="voyageRibbon"><div class="voyage-ribbon-grid">' +
      '<div class="vr-chip"><span class="vr-kicker">\u9999\u6e2f</span><span class="vr-value" id="clockHkt">--:--</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">\u97d3\u570b</span><span class="vr-value" id="clockKst">--:--</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">\u532f\u7387</span><span class="vr-value" id="fxRibbonRate">1 HKD \u2248 173</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">\u5929\u6c23</span><span class="vr-value">\u9996\u723e <span id="wxSeoul">--</span> \u00b7 \u6fdf\u5dde <span id="wxJeju">--</span></span></div>' +
      '</div></div>'
    );
  }
  function injectOverlays() {
    if (document.getElementById('searchOverlay')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="overlay-sheet" id="searchOverlay" onclick="if(event.target===this)closeSearchModal()"><div class="overlay-panel"><div class="overlay-head"><h3>\u641c\u5c0b\u884c\u7a0b</h3><button class="overlay-close" onclick="closeSearchModal()">\u95dc\u9589</button></div><input id="omnisearchInput" class="omni-input" placeholder="\u5e97\u540d / \u666f\u9ede / \u822a\u73ed" oninput="runOmnisearch(this.value)"/><div id="omnisearchResults" class="omni-results"></div></div></div>' +
      '<div class="overlay-sheet" id="sosOverlay" onclick="if(event.target===this)closeSosSheet()"><div class="overlay-panel"><div class="overlay-head"><h3>\u7dca\u6025\u901f\u67e5</h3><button class="overlay-close" onclick="closeSosSheet()">\u95dc\u9589</button></div><div class="sos-grid">' +
      '<a class="sos-card" href="tel:112"><b>112 \u8b66\u5bdf</b></a><a class="sos-card" href="tel:119"><b>119 \u6551\u8b77</b></a>' +
      '<a class="sos-card" href="tel:1330"><b>1330 \u89c0\u5149</b></a><a class="sos-card" href="tel:+82-10-3212-6215"><b>\u9996\u723e\u79df\u8eca</b></a>' +
      '<a class="sos-card" href="tel:1588-1230"><b>\u6fdf\u5dde\u6a02\u5929</b></a>' +
      '<button class="sos-card" onclick="copyValue(\'3410\',\'PIN\')"><b>\u53d6\u8eca PIN 3410</b></button></div></div></div>'
    );
  }
  function enhanceDayView() {
    if (typeof window.renderDayDetail !== 'function') return;
    var orig = window.renderDayDetail;
    window.renderDayDetail = function (num) {
      orig(num);
      compactHeaderTitle();
      var wrap = document.getElementById('dayDetailContainer');
      if (!wrap || wrap.querySelector('.day-note-box')) return;
      wrap.insertAdjacentHTML('beforeend', '<div class="day-tools"><button onclick="shareDay(' + num + ')">\u5206\u4eab\u4eca\u65e5</button><button onclick="copyDaySummary(' + num + ')">\u8907\u88fd\u6458\u8981</button></div><div class="day-note-box"><textarea id="dayNoteField" placeholder="\u7576\u65e5\u624b\u8a18" oninput="saveDayNote(' + num + ', this.value)"></textarea></div>');
      var noteEl = document.getElementById('dayNoteField');
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

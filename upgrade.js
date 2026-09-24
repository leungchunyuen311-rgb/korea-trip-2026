/* Lai's Family Korea 2026 voyage upgrade */
(function () {
  var FULL_NAME = "Lai's Family Seoul & Jeju Trip 2026";
  function injectPhoneCss() {
    if (document.getElementById('voyage-phone-css')) return;
    var s = document.createElement('style');
    s.id = 'voyage-phone-css';
    s.textContent = [
      'html{-webkit-text-size-adjust:100%;text-size-adjust:100%}',
      'button,a,input,textarea{touch-action:manipulation}',
      '.header-site-title,.main-hero-title,.hero-cover-sub{letter-spacing:0!important}',
      '@media (max-width:900px){',
      '.header-top-ribbon,.editorial-nav-dock,.header-site-subtitle,.hero-cover-cities,.hero-cover-tag{display:none!important}',
      '.header-main-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:calc(8px + env(safe-area-inset-top,0px)) 10px 8px!important}',
      '.header-brand-group{min-width:0;flex:1;display:flex!important;align-items:center!important;gap:8px!important}',
      '.header-title-box{min-width:0;flex:1}',
      '.header-site-title{font-size:13px!important;line-height:1.25!important;letter-spacing:0!important;font-weight:800!important;display:-webkit-box!important;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden!important;white-space:normal!important}',
      '.header-avatar-frame,.header-avatar-img{width:34px!important;height:34px!important;border-radius:50%;flex-shrink:0}',
      '.header-action-group{display:flex!important;gap:5px!important;flex-shrink:0}',
      '.btn-theme-pill{width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;border-radius:12px!important;justify-content:center}',
      '.header-action-group .theme-label{display:none!important}',
      '.main-hero-title{font-size:1.35rem!important;line-height:1.25!important;letter-spacing:0!important}',
      '.hero-cover-card{height:220px!important;border-radius:16px}',
      '.hero-cover-sub{font-size:13px!important}',
      '.countdown-bar{display:flex!important;flex-direction:column!important;gap:8px!important;padding:14px!important}',
      '.countdown-timer-boxes{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:6px!important;width:100%}',
      '.countdown-box{min-width:0!important;padding:10px 0!important}',
      '.countdown-num{font-size:20px!important}',
      '.voyage-ribbon-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}',
      '.vr-chip{min-height:0!important;padding:10px!important}',
      '.vr-value{font-size:15px!important}',
      '.app-main,main{padding:12px 12px calc(100px + env(safe-area-inset-bottom,0px))!important}',
      '.mobile-bottom-nav{padding:6px 6px calc(8px + env(safe-area-inset-bottom,0px))!important}',
      '.bot-nav-btn{min-height:48px}',
      '.day-pills-bar{display:flex!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch;gap:8px!important}',
      '}',
      '@media (max-width:560px){.voyage-ribbon-grid{grid-template-columns:1fr!important}}'
    ].join('');
    document.head.appendChild(s);
  }
  function setOfficialName() {
    var header = document.querySelector('.header-site-title');
    if (header) header.textContent = FULL_NAME;
    var hero = document.querySelector('.main-hero-title');
    if (hero) hero.textContent = FULL_NAME;
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
    if (day >= 1 && day <= 9 && typeof openDay === 'function') {
      openDay(day);
      // Highlight the Today button instead of "每日" when showing today's page
      document.querySelectorAll('.bot-nav-btn').forEach(function (b) { b.classList.remove('active'); });
      var t = document.getElementById('bot-nav-today');
      if (t) t.classList.add('active');
    } else if (typeof showView === 'function') showView('index');
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
      if (sEl && jEl) saveLive('wx', { s: sEl.textContent, j: jEl.textContent });
      markUpdated('wx', null);
    } catch (e) {
      var last = loadLive('wx');
      if (!last) return;
      var s2 = document.getElementById('wxSeoul'), j2 = document.getElementById('wxJeju');
      if (s2) s2.textContent = last.v.s;
      if (j2) j2.textContent = last.v.j;
      markUpdated('wx', last.t);
    }
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
      saveLive('fx', data.rates.KRW);
      markUpdated('fx', null);
    } catch (e) {
      var last = loadLive('fx');
      if (!last) return;
      try { if (typeof KRW_TO_HKD_RATE !== 'undefined') KRW_TO_HKD_RATE = 1 / last.v; } catch (e2) {}
      var rb = document.getElementById('fxRibbonRate');
      if (rb) rb.textContent = '1 HKD \u2248 ' + Math.round(last.v);
      markUpdated('fx', last.t);
    }
  }
  /* ===== Offline helpers: remember last live weather / FX ===== */
  var LIVE_KEY = 'korea_trip_live_cache_v1';
  function saveLive(kind, value) {
    try { var all = JSON.parse(localStorage.getItem(LIVE_KEY) || '{}'); all[kind] = { v: value, t: Date.now() }; localStorage.setItem(LIVE_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function loadLive(kind) {
    try { return JSON.parse(localStorage.getItem(LIVE_KEY) || '{}')[kind] || null; } catch (e) { return null; }
  }
  function markUpdated(kind, time) {
    var anchor = document.getElementById(kind === 'fx' ? 'fxRibbonRate' : 'wxSeoul');
    if (!anchor) return;
    var chip = anchor.closest('.vr-chip');
    if (!chip) return;
    var note = chip.querySelector('.vr-stale');
    if (!time) { if (note) note.remove(); return; }
    var d = new Date(time);
    var label = '\u4e0a\u6b21\u66f4\u65b0 ' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    if (!note) { note = document.createElement('span'); note.className = 'vr-stale'; chip.appendChild(note); }
    note.textContent = label;
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
    var lines = [FULL_NAME + ' Day ' + d.num, d.date + ' ' + d.region, d.title];
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
    if (navigator.share) navigator.share({ title: FULL_NAME + ' Day ' + num, text: text }).catch(function () { window.copyDaySummary(num); });
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
      setOfficialName();
      var wrap = document.getElementById('dayDetailContainer');
      if (!wrap || wrap.querySelector('.day-note-box')) return;
      wrap.insertAdjacentHTML('beforeend', '<div class="day-tools"><button onclick="shareDay(' + num + ')">\u5206\u4eab\u4eca\u65e5</button><button onclick="copyDaySummary(' + num + ')">\u8907\u88fd\u6458\u8981</button></div><div class="day-note-box"><textarea id="dayNoteField" placeholder="\u7576\u65e5\u624b\u8a18" oninput="saveDayNote(' + num + ', this.value)"></textarea></div>');
      var noteEl = document.getElementById('dayNoteField');
      if (noteEl) noteEl.value = loadDayNote(num);
    };
  }
  /* ===== Offline banner ===== */
  function updateOnlineState() {
    var bar = document.getElementById('offlineBar');
    if (!bar) {
      var main = document.querySelector('.app-main') || document.body;
      main.insertAdjacentHTML('afterbegin', '<div class="offline-bar" id="offlineBar" role="status">\u76ee\u524d\u96e2\u7dda\uff0c\u6b63\u5728\u986f\u793a\u5df2\u5132\u5b58\u7684\u884c\u7a0b</div>');
      bar = document.getElementById('offlineBar');
    }
    bar.style.display = navigator.onLine ? 'none' : 'block';
  }
  /* ===== Service worker (offline copy) ===== */
  var OFFLINE_FLAG = 'korea_trip_offline_ready_v1';
  function registerOffline() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      var sw = reg.installing || reg.waiting;
      if (!sw) return;
      sw.addEventListener('statechange', function () {
        if (sw.state === 'activated' && !localStorage.getItem(OFFLINE_FLAG)) {
          localStorage.setItem(OFFLINE_FLAG, '1');
          if (typeof showToast === 'function') showToast('\u5df2\u5132\u5b58\u96e2\u7dda\u7248\u672c\uff0c\u6c92\u6709\u7db2\u7d61\u4e5f\u80fd\u958b\u555f');
        }
      });
    }).catch(function () {});
  }
  /* ===== Today: bottom button, overview card, auto-open during trip ===== */
  function tripDays() {
    try { return allDaysData; } catch (e) { return []; }
  }
  function injectTodayButton() {
    var nav = document.querySelector('.mobile-bottom-nav');
    if (!nav || document.getElementById('bot-nav-today')) return;
    var day = getTripDayNumber(new Date());
    var label = (day >= 1 && day <= 9) ? 'Day ' + day : '\u4eca\u65e5';
    var btn = document.createElement('button');
    btn.className = 'bot-nav-btn bot-nav-today';
    btn.id = 'bot-nav-today';
    btn.setAttribute('aria-label', '\ud83d\udccd \u4eca\u65e5');
    btn.onclick = function () { window.jumpToToday(); };
    btn.innerHTML = '<span class="today-orb">\ud83d\udccd</span><span>' + label + '</span>';
    var slot = document.getElementById('bot-nav-money');
    nav.insertBefore(btn, slot || null);
  }
  function injectTodayCard() {
    var day = getTripDayNumber(new Date());
    if (day < 1 || day > 9 || document.getElementById('todayCard')) return;
    var d = tripDays().find(function (x) { return x.num === day; });
    var panel = document.getElementById('view-index');
    if (!d || !panel) return;
    panel.insertAdjacentHTML('afterbegin',
      '<button class="today-card" id="todayCard" onclick="jumpToToday()">' +
      '<span class="today-card-kicker">\u4eca\u65e5\u884c\u7a0b</span>' +
      '<span class="today-card-meta">Day ' + d.num + ' \u00b7 ' + d.date + ' \u00b7 ' + d.region + '</span>' +
      '<span class="today-card-title">' + d.title + '</span></button>');
  }
  /* ===== Packing: entry card on overview (bottom tab removed) ===== */
  function syncPackEntry() {
    var src = document.getElementById('packProgressText');
    var bar = document.getElementById('packProgressBar');
    var txt = document.getElementById('packEntryText');
    var fill = document.getElementById('packEntryFill');
    if (src && txt) txt.textContent = src.textContent;
    if (bar && fill) fill.style.width = bar.style.width || '0%';
  }
  function injectPackEntry() {
    if (document.getElementById('packEntry')) return;
    var anchor = document.querySelector('#view-index .progress-wrapper');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend',
      '<button class="pack-entry" id="packEntry" onclick="showView(\'packing\')">' +
      '<span class="pack-entry-main"><span class="pack-entry-title">\ud83c\udf92 \u884c\u674e</span>' +
      '<span class="pack-entry-progress" id="packEntryText"></span>' +
      '<span class="pack-entry-track"><span class="pack-entry-fill" id="packEntryFill"></span></span></span>' +
      '<span class="pack-entry-arrow" aria-hidden="true">\u203a</span></button>');
    var packView = document.getElementById('view-packing');
    if (packView && !packView.querySelector('.back-to-index-btn')) {
      packView.insertAdjacentHTML('afterbegin', '<button class="back-to-index-btn" onclick="showView(\'index\')">\u2190 \u8fd4\u56de\u884c\u7a0b\u7e3d\u89bd Index</button>');
    }
    if (typeof window.updatePackingProgress === 'function') {
      var orig = window.updatePackingProgress;
      window.updatePackingProgress = function () { orig.apply(this, arguments); syncPackEntry(); };
      window.updatePackingProgress();
    } else {
      syncPackEntry();
    }
  }
  function autoOpenToday() {
    var day = getTripDayNumber(new Date());
    if (day >= 1 && day <= 9 && !location.hash) window.jumpToToday();
  }
  function boot() {
    injectPhoneCss();
    setOfficialName();
    injectHeaderButtons();
    injectRibbon();
    injectOverlays();
    enhanceDayView();
    tickClocks();
    setInterval(tickClocks, 1000);
    loadLiveFx();
    loadLiveWeather();
    updateOnlineState();
    window.addEventListener('online', function () { updateOnlineState(); loadLiveFx(); loadLiveWeather(); });
    window.addEventListener('offline', updateOnlineState);
    injectTodayButton();
    injectPackEntry();
    injectTodayCard();
    autoOpenToday();
    registerOffline();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

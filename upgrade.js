/* Lai's Family Korea 2026 voyage upgrade */
(function () {
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
      openDay(day); toast('\u5df2\u958b\u555f\u7b2c ' + day + ' \u65e5\u884c\u7a0b');
    } else if (typeof showView === 'function') {
      showView('index');
      toast(day === 0 ? '\u65c5\u7a0b\u5c1a\u672a\u51fa\u767c\uff0c\u986f\u793a\u7e3d\u89bd\u5012\u6578' : '\u65c5\u7a0b\u5df2\u7d50\u675f\uff0c\u8fd4\u56de\u5178\u85cf\u7e3d\u89bd');
    }
  };
  function wxIcon(code) {
    if (code === 0) return '\u2600\ufe0f';
    if (code <= 3) return '\u26c5';
    if (code <= 48) return '\ud83c\udf2b\ufe0f';
    if (code <= 67) return '\ud83c\udf27\ufe0f';
    if (code <= 77) return '\ud83c\udf28\ufe0f';
    if (code <= 82) return '\ud83c\udf26\ufe0f';
    return '\u26c8\ufe0f';
  }
  async function loadLiveWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.57,33.50&longitude=126.98,126.53&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul';
    try {
      const res = await fetch(url);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [data];
      const seoul = rows[0];
      const jeju = rows[1] || rows[0];
      const sEl = document.getElementById('wxSeoul');
      const jEl = document.getElementById('wxJeju');
      if (sEl && seoul && seoul.current) {
        sEl.textContent = wxIcon(seoul.current.weather_code) + ' ' + Math.round(seoul.current.temperature_2m) + '\u00b0C  (' +
          Math.round(seoul.daily.temperature_2m_min[0]) + '\u2013' + Math.round(seoul.daily.temperature_2m_max[0]) + '\u00b0)';
      }
      if (jEl && jeju && jeju.current) {
        jEl.textContent = wxIcon(jeju.current.weather_code) + ' ' + Math.round(jeju.current.temperature_2m) + '\u00b0C  (' +
          Math.round(jeju.daily.temperature_2m_min[0]) + '\u2013' + Math.round(jeju.daily.temperature_2m_max[0]) + '\u00b0)';
      }
      const meta = document.getElementById('wxMeta');
      if (meta) meta.textContent = '\u5373\u6642\u6c23\u6eab \u00b7 Open-Meteo \u00b7 \u97d3\u570b\u6642\u9593';
    } catch (err) {
      const meta = document.getElementById('wxMeta');
      if (meta) meta.textContent = '\u5929\u6c23\u66ab\u6642\u672a\u80fd\u66f4\u65b0';
    }
  }
  function applyFxRate(krwPerHkd) {
    if (!krwPerHkd || !isFinite(krwPerHkd) || krwPerHkd < 100) return;
    try { if (typeof KRW_TO_HKD_RATE !== 'undefined') KRW_TO_HKD_RATE = 1 / krwPerHkd; } catch (e) {}
    window.KRW_TO_HKD_RATE = 1 / krwPerHkd;
    const pretty = Math.round(krwPerHkd);
    const title = document.querySelector('.cheatsheet-title span');
    if (title) title.textContent = '\ud83d\udcb1 \u5e38\u7528\u97d3\u5713\u6975\u901f\u63db\u7b97 (\u5373\u6642 1 HKD \u2248 ' + pretty + ' KRW)';
    const ribbon = document.getElementById('fxRibbonRate');
    if (ribbon) ribbon.textContent = '1 HKD \u2248 ' + pretty + ' KRW';
    document.querySelectorAll('.krw-chip').forEach((el) => {
      const m = el.textContent.match(/\u20a9([\d,]+)/);
      if (!m) return;
      const krw = parseInt(m[1].replace(/,/g, ''), 10);
      const hkd = Math.round(krw / krwPerHkd);
      el.innerHTML = el.innerHTML.replace(/HK\$\d+/, 'HK$' + hkd);
    });
    if (typeof convertFromKrw === 'function') convertFromKrw();
  }
  async function loadLiveFx() {
    const meta = document.getElementById('fxRibbonMeta');
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/HKD');
      const data = await res.json();
      const krw = data && data.rates && data.rates.KRW;
      if (!krw) throw new Error('no KRW');
      applyFxRate(krw);
      if (meta) meta.textContent = '\u4e2d\u9593\u50f9 \u00b7 ' + (data.time_last_update_utc || 'live');
    } catch (err) {
      if (meta) meta.textContent = '\u6cbf\u7528\u53c3\u8003\u532f\u7387 173';
    }
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
    const note = loadDayNote(num);
    if (note) lines.push(note);
    return lines.join('\n');
  }
  window.copyDaySummary = function (num) {
    if (typeof copyValue === 'function') copyValue(daySummaryText(num), 'copied day ' + num);
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
      items.push({ label: 'DAY ' + d.num + ' | ' + d.date + ' | ' + d.title, hint: d.region, hay: (d.title + d.region + d.highlight + d.date).toLowerCase(), go: () => openDay(d.num) });
      (d.events || []).forEach(ev => {
        if (!ev.title) return;
        items.push({ label: ev.title, hint: 'Day ' + d.num + ' ' + (ev.time || ''), hay: ((ev.title||'') + (ev.hangul||'') + (ev.desc||'')).toLowerCase(), go: () => openDay(d.num) });
      });
    });
    items.push({ label: 'Treasury', hint: 'FX', hay: 'money fx krw hkd', go: () => showView('money') });
    items.push({ label: 'Transit', hint: 'flights', hay: 'flight car hotel staria ioniq', go: () => showView('transit') });
    items.push({ label: 'Food', hint: 'bars', hay: 'food bar pork coffee zest cham', go: () => showView('food') });
    items.push({ label: 'Packing', hint: 'list', hay: 'passport adapter', go: () => showView('packing') });
    items.push({ label: 'Phrases', hint: 'korean', hay: 'korean toilet bill', go: () => showView('phrases') });
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
    if (!hits.length) { box.innerHTML = '<div class="omni-empty">No results</div>'; return; }
    box.innerHTML = hits.map(it => '<button class="omni-item"><b>' + it.label + '</b><small>' + it.hint + '</small></button>').join('');
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
  function fixBrandTitles() {
    document.querySelectorAll('.header-site-title, .main-hero-title, .hero-cover-sub').forEach((el) => {
      if (el.querySelector('.brand-apos')) return;
      el.innerHTML = el.innerHTML.replace(/Lai[\u2019']\s*s/g, 'Lai<span class="brand-apos">\u2019</span>s');
    });
    const vp = document.querySelector('meta[name="viewport"]');
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
  }
  function injectHeaderButtons() {
    const group = document.querySelector('.header-action-group');
    if (!group || group.querySelector('[data-upgrade-btn]')) return;
    group.insertAdjacentHTML('afterbegin',
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="openSearchModal()"><span class="theme-icon">\ud83d\udd0d</span><span class="theme-label">\u641c\u5c0b</span></button>' +
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="jumpToToday()"><span class="theme-icon">\ud83d\udcc5</span><span class="theme-label">\u4eca\u65e5</span></button>' +
      '<button class="btn-theme-pill" data-upgrade-btn="1" onclick="openSosSheet()"><span class="theme-icon">\ud83c\udd98</span><span class="theme-label">\u7dca\u6025</span></button>'
    );
  }
  function injectRibbon() {
    if (document.getElementById('voyageRibbon')) return;
    const metrics = document.querySelector('.trip-metrics-bar');
    if (!metrics) return;
    metrics.insertAdjacentHTML('afterend',
      '<div class="voyage-ribbon" id="voyageRibbon"><div class="voyage-ribbon-grid">' +
      '<div class="vr-chip"><span class="vr-kicker">HONG KONG \u00b7 HKT</span><span class="vr-value" id="clockHkt">--:--</span><span class="vr-sub">UTC+8</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">SEOUL / JEJU \u00b7 KST</span><span class="vr-value" id="clockKst">--:--</span><span class="vr-sub">UTC+9</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">LIVE FX</span><span class="vr-value" id="fxRibbonRate">1 HKD \u2248 173 KRW</span><span class="vr-sub" id="fxRibbonMeta">loading</span></div>' +
      '<div class="vr-chip"><span class="vr-kicker">LIVE WEATHER</span><div class="vr-weather-row"><div><b>Seoul</b> <span id="wxSeoul">...</span></div><div><b>Jeju</b> <span id="wxJeju">...</span></div></div><span class="vr-sub" id="wxMeta">Open-Meteo</span></div>' +
      '</div><div class="voyage-search-row"><button class="voyage-search-btn" onclick="openSearchModal()">Search itinerary / restaurant / hotel <kbd>/</kbd></button><button class="voyage-today-btn" onclick="jumpToToday()">Today</button></div></div>'
    );
  }
  function injectOverlays() {
    if (document.getElementById('searchOverlay')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="overlay-sheet" id="searchOverlay" onclick="if(event.target===this)closeSearchModal()"><div class="overlay-panel"><div class="overlay-head"><div><div class="overlay-kicker">INDEX</div><h3>Search</h3></div><button class="overlay-close" onclick="closeSearchModal()">Close</button></div><input id="omnisearchInput" class="omni-input" type="search" placeholder="place / flight / phrase" oninput="runOmnisearch(this.value)"/><div id="omnisearchResults" class="omni-results"></div></div></div>' +
      '<div class="overlay-sheet" id="sosOverlay" onclick="if(event.target===this)closeSosSheet()"><div class="overlay-panel"><div class="overlay-head"><div><div class="overlay-kicker">SOS</div><h3>Emergency</h3></div><button class="overlay-close" onclick="closeSosSheet()">Close</button></div><div class="sos-grid">' +
      '<a class="sos-card" href="tel:112"><span>112</span><b>Police</b></a>' +
      '<a class="sos-card" href="tel:119"><span>119</span><b>Fire / Ambulance</b></a>' +
      '<a class="sos-card" href="tel:1330"><span>1330</span><b>Tourist hotline</b></a>' +
      '<a class="sos-card" href="tel:+82-10-3212-6215"><span>Seoul car</span><b>+82-10-3212-6215</b></a>' +
      '<a class="sos-card" href="tel:1588-1230"><span>Jeju Lotte</span><b>1588-1230</b></a>' +
      '<button class="sos-card" onclick="copyValue(\'3410\',\'PIN 3410\')"><span>Seoul PIN</span><b>3410</b></button>' +
      '<button class="sos-card" onclick="copyValue(\'2622541225\',\'Jeju booking\')"><span>Jeju booking</span><b>2622541225</b></button>' +
      '<a class="sos-card" href="https://map.naver.com" target="_blank" rel="noopener"><span>Map</span><b>Naver Map</b></a>' +
      '</div><p class="sos-note">Use Naver / Kakao for driving, not Google Maps.</p></div></div>'
    );
  }
  function enhanceDayView() {
    if (typeof window.renderDayDetail !== 'function') return;
    const orig = window.renderDayDetail;
    window.renderDayDetail = function (num) {
      orig(num);
      const wrap = document.getElementById('dayDetailContainer');
      if (!wrap || wrap.querySelector('.day-note-box')) return;
      wrap.insertAdjacentHTML('beforeend',
        '<div class="day-tools"><button type="button" onclick="shareDay(' + num + ')">Share day</button><button type="button" onclick="copyDaySummary(' + num + ')">Copy summary</button></div>' +
        '<div class="day-note-box"><div class="vr-kicker">DAY NOTES</div><textarea id="dayNoteField" oninput="saveDayNote(' + num + ', this.value)"></textarea></div>'
      );
      const noteEl = document.getElementById('dayNoteField');
      if (noteEl) noteEl.value = loadDayNote(num);
    };
  }
  function markTodayOnIndex() {
    const day = getTripDayNumber(new Date());
    if (day < 1 || day > 9) return;
    document.querySelectorAll('[onclick*="openDay"]').forEach(el => {
      const attr = el.getAttribute('onclick') || '';
      if (attr.indexOf('openDay(' + day + ')') >= 0 && !el.querySelector('.today-chip')) {
        const chip = document.createElement('span');
        chip.className = 'today-chip'; chip.textContent = 'TODAY'; el.appendChild(chip);
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); openSearchModal(); }
    if (e.key === 'Escape') { closeSearchModal(); closeSosSheet(); }
  });
  function boot() {
    fixBrandTitles(); injectHeaderButtons(); injectRibbon(); injectOverlays(); enhanceDayView(); markTodayOnIndex();
    tickClocks(); setInterval(tickClocks, 1000); loadLiveFx(); loadLiveWeather();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

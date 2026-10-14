(function () {
  'use strict';
  var script = document.currentScript;
  var endpoint = (script && script.dataset.endpoint) || (location.origin + '/api/events');
  var key = 'signalpath_session_id';

  function makeId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'sp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }
  function getSessionId() {
    try {
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var created = makeId();
      localStorage.setItem(key, created);
      return created;
    } catch (_) {
      var match = document.cookie.match(/(?:^|; )signalpath_session_id=([^;]+)/);
      if (match) return decodeURIComponent(match[1]);
      var fallback = makeId();
      document.cookie = 'signalpath_session_id=' + encodeURIComponent(fallback) + '; path=/; SameSite=Lax';
      return fallback;
    }
  }
  function send(type, extra) {
    var payload = Object.assign({
      session_id: getSessionId(),
      type: type,
      page_url: location.href,
      timestamp: new Date().toISOString(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    }, extra || {});
    var body = JSON.stringify(payload);
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: true,
      credentials: 'omit'
    }).catch(function () { /* Analytics must never break the host page. */ });
  }
  send('page_view');
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || target.closest && target.closest('[data-analytics-ignore]')) return;
    send('click', { x: Math.max(0, Math.round(event.clientX)), y: Math.max(0, Math.round(event.clientY)) });
  }, { passive: true });
})();

const MAX_BATCH = 50;

export function normalizeEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Each event must be an object.');
  }
  const { session_id, type, page_url, timestamp, x, y, viewport_width, viewport_height } = input;
  if (typeof session_id !== 'string' || session_id.trim().length < 8 || session_id.length > 128) {
    throw new Error('session_id must be a string between 8 and 128 characters.');
  }
  if (!['page_view', 'click'].includes(type)) throw new Error('Unsupported event type.');
  if (typeof page_url !== 'string' || page_url.length > 2048) throw new Error('page_url is required and must be under 2048 characters.');
  let parsedUrl;
  try { parsedUrl = new URL(page_url); } catch { throw new Error('page_url must be a valid absolute URL.'); }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Only HTTP and HTTPS page URLs are supported.');
  const date = new Date(timestamp);
  if (!timestamp || Number.isNaN(date.getTime())) throw new Error('timestamp must be a valid date.');
  const event = {
    sessionId: session_id.trim(),
    type,
    pageUrl: parsedUrl.href,
    timestamp: date
  };
  if (type === 'click') {
    if (![x, y].every(n => Number.isFinite(n) && n >= 0 && n <= 100000)) {
      throw new Error('Click events require valid non-negative x and y coordinates.');
    }
    event.coordinates = { x, y };
  }
  if (Number.isFinite(viewport_width) && viewport_width > 0 && viewport_width <= 20000 &&
      Number.isFinite(viewport_height) && viewport_height > 0 && viewport_height <= 20000) {
    event.viewport = { width: viewport_width, height: viewport_height };
  }
  return event;
}

export function normalizeBatch(body) {
  const values = Array.isArray(body?.events) ? body.events : [body];
  if (!values.length || values.length > MAX_BATCH) throw new Error(`Send between 1 and ${MAX_BATCH} events per request.`);
  return values.map(normalizeEvent);
}

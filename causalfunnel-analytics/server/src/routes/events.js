import { Router } from 'express';
import Event from '../models/Event.js';
import { normalizeBatch } from '../validation.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const events = normalizeBatch(req.body);
    const result = await Event.insertMany(events, { ordered: true });
    res.status(201).json({ accepted: result.length });
  } catch (error) {
    if (error.message && !error.name?.startsWith('Mongo')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

router.get('/sessions', async (_req, res, next) => {
  try {
    const sessions = await Event.aggregate([
      { $sort: { timestamp: 1 } },
      { $group: {
        _id: '$sessionId',
        totalEvents: { $sum: 1 },
        firstSeen: { $first: '$timestamp' },
        lastSeen: { $last: '$timestamp' },
        pages: { $addToSet: '$pageUrl' }
      }},
      { $project: {
        _id: 0, sessionId: '$_id', totalEvents: 1, firstSeen: 1, lastSeen: 1,
        pageCount: { $size: '$pages' }
      }},
      { $sort: { lastSeen: -1 } },
      { $limit: 200 }
    ]);
    res.json({ sessions });
  } catch (error) { next(error); }
});

router.get('/sessions/:sessionId/events', async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    if (sessionId.length > 128) return res.status(400).json({ error: 'Invalid session ID.' });
    const events = await Event.find({ sessionId }).sort({ timestamp: 1 }).limit(1000).lean();
    res.json({ events: events.map(e => ({
      id: e._id, session_id: e.sessionId, type: e.type, page_url: e.pageUrl,
      timestamp: e.timestamp, x: e.coordinates?.x, y: e.coordinates?.y,
      viewport: e.viewport
    })) });
  } catch (error) { next(error); }
});

router.get('/heatmap/pages', async (_req, res, next) => {
  try {
    const pages = await Event.aggregate([
      { $match: { type: 'click' } },
      { $group: { _id: '$pageUrl', clicks: { $sum: 1 } } },
      { $project: { _id: 0, url: '$_id', clicks: 1 } },
      { $sort: { clicks: -1 } },
      { $limit: 100 }
    ]);
    res.json({ pages });
  } catch (error) { next(error); }
});

router.get('/heatmap/clicks', async (req, res, next) => {
  try {
    const url = req.query.url;
    if (typeof url !== 'string' || !url || url.length > 2048) {
      return res.status(400).json({ error: 'A valid url query parameter is required.' });
    }
    const clicks = await Event.find({ pageUrl: url, type: 'click' })
      .sort({ timestamp: -1 }).limit(5000).select('coordinates viewport timestamp').lean();
    res.json({ clicks: clicks.map(c => ({
      x: c.coordinates?.x ?? 0, y: c.coordinates?.y ?? 0,
      width: c.viewport?.width ?? 1280, height: c.viewport?.height ?? 800,
      timestamp: c.timestamp
    })) });
  } catch (error) { next(error); }
});

export default router;

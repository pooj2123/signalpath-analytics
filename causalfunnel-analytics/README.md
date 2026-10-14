# SignalPath — User Analytics Application

A compact, full-stack user-behavior analytics application built for the CausalFunnel Full Stack Engineer assignment. It captures page views and clicks, groups events by browser session, exposes a small REST API, and displays session journeys and a click heatmap.

## Tech stack
- **Dashboard + demo site:** React, Vite, TypeScript, plain CSS
- **API:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Tracking:** Vanilla JavaScript snippet (`public/tracker.js`)
- **Validation/security:** Helmet, CORS allow-list, express-rate-limit, input validation, request-size limits

The implementation intentionally uses straightforward code and small modules so the data flow is easy to explain during evaluation.

## Features
- `page_view` and `click` tracking with `session_id`, page URL, timestamp, and click coordinates.
- Session ID stored in `localStorage`, with a cookie fallback.
- Batch event ingestion with validation and MongoDB persistence.
- Sessions list with total event count, first/last activity, and page count.
- Ordered user journey for a selected session.
- Page selector and click-position overlay for the heatmap.
- Demo storefront that generates real events.
- Seed/demo events can be created by using the demo site; no fake analytics are inserted automatically.
- Responsive layout, loading/error/empty states, and API health endpoint.

## Requirements
- Node.js 20+
- MongoDB 6+ (local MongoDB or MongoDB Atlas)
- npm

## Run locally

### 1. Configure the API
```bash
cd server
cp .env.example .env
```
Edit `server/.env` and set `MONGODB_URI`. For local MongoDB, the default example URI is suitable if MongoDB is running locally.

### 2. Install and start the API
```bash
cd server
npm install
npm run dev
```
The API runs at `http://localhost:4000`.

### 3. Install and start the dashboard
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
The dashboard runs at `http://localhost:5173`. Vite proxies `/api` requests to the API.

### 4. Generate analytics
Open `http://localhost:5173/demo` and interact with the demo page. Then return to `/` to view sessions and click heatmap data.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | API/database health |
| `POST` | `/api/events` | Ingest one event or `{ events: [...] }` |
| `GET` | `/api/sessions` | Sessions with counts and activity |
| `GET` | `/api/sessions/:sessionId/events` | Chronological event journey |
| `GET` | `/api/heatmap/pages` | Distinct pages with click events |
| `GET` | `/api/heatmap/clicks?url=...` | Click coordinates for a page |

## Tracking on another webpage
Include the script on the page:
```html
<script
  src="http://localhost:4000/tracker.js"
  data-endpoint="http://localhost:4000/api/events"
  defer
></script>
```
The server serves the tracker at `/tracker.js`. The tracker records a page view and click coordinates relative to the viewport. For a production deployment, serve the tracker and tracked page over HTTPS and configure the API's `CLIENT_ORIGIN` to the dashboard/site origins.

## Configuration
See `server/.env.example`:
- `PORT`: API port (default `4000`)
- `MONGODB_URI`: MongoDB connection string
- `CLIENT_ORIGIN`: comma-separated allowed browser origins
- `RATE_LIMIT_MAX`: max requests per 15-minute window

## Data model
Each event document contains:
- `sessionId` (indexed)
- `type` (`page_view` or `click`)
- `pageUrl`
- `timestamp`
- optional `coordinates: { x, y }`
- optional `viewport: { width, height }`

Timestamps are supplied by the client but validated; the API normalizes them to ISO dates. Coordinates are viewport-relative, which keeps the visualization simple and consistent.

## Assumptions and trade-offs
- A session persists in the same browser until local storage is cleared; this is a lightweight session identity, not authenticated identity.
- The heatmap uses viewport-relative pixel coordinates and shows a normalized percentage overlay. It is a visual aid, not a DOM-aware or scroll-position-aware heatmap.
- No user-identifying form data or keystrokes are collected.
- The demo is intended for evaluation and local development. Before public production deployment, add authentication/authorization for the dashboard, retention controls, consent handling appropriate to the deployment jurisdiction, and a managed database with backups.
- MongoDB indexes support the most common session and page queries. Aggregation pipelines calculate session counts server-side.

## Project structure
```text
causalfunnel-analytics/
├── client/                 # React dashboard and demo page
└── server/                 # Express API, MongoDB model, tracker script
```

## Troubleshooting
- **MongoDB connection fails:** verify `MONGODB_URI`, database user/password, Atlas IP allow-list, and network access.
- **Dashboard says API unavailable:** start the API on port 4000 and check `GET /api/health`.
- **No sessions appear:** visit `/demo` and click around. Events are only stored when MongoDB is connected.
- **CORS errors:** add the exact origin(s), including scheme and port, to `CLIENT_ORIGIN`.

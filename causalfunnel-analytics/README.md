# SignalPath — User Behavior Analytics Platform

A full-stack web analytics application for tracking browser activity, exploring user journeys, and visualizing click behavior.

**[Live Dashboard](https://signalpath-analytics.vercel.app/)** · **[API Health](https://signalpath-api.onrender.com/api/health)** · **[GitHub Repository](https://github.com/pooj2123/signalpath-analytics)**

## Overview

SignalPath is a full-stack user-behavior analytics application developed for the CausalFunnel Full Stack Engineer assignment.

It captures browser page views and clicks, groups activity into sessions, stores validated events in MongoDB, and displays session journeys and click-position visualizations through an interactive dashboard.

The project demonstrates browser-side event tracking, REST API development, database persistence, analytics queries, and cloud deployment.

## Live Demo

- **Dashboard:** https://signalpath-analytics.vercel.app/
- **Backend API:** https://signalpath-api.onrender.com/
- **API health endpoint:** https://signalpath-api.onrender.com/api/health
- **Source code:** https://github.com/pooj2123/signalpath-analytics

Open the dashboard and launch the demo storefront. Interact with the demo page to generate events, then return to the dashboard to explore sessions and click data.

## Features

- **Browser event tracking:** Captures `page_view` and `click` events with session IDs, page URLs, timestamps, and click coordinates.
- **Session identification:** Uses browser `localStorage`, with a cookie fallback.
- **Event ingestion:** Accepts individual events and batches with input validation.
- **Session analytics:** Displays event counts, first and last activity, and page counts.
- **User journey exploration:** Presents events chronologically for a selected session.
- **Click heatmap:** Visualizes recorded click positions for selected pages.
- **Interactive demo storefront:** Generates real events through browser interactions.
- **Persistent storage:** Stores event data in MongoDB through Mongoose.
- **API health endpoint:** Reports API and database connectivity.
- **Security controls:** Uses Helmet, CORS origin restrictions, rate limiting, request-size limits, and input validation.
- **Responsive dashboard:** Includes loading, error, and empty states.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Event tracking | Vanilla JavaScript |
| Security | Helmet, CORS, express-rate-limit |
| Frontend deployment | Vercel |
| Backend deployment | Render |

## System Architecture

```text
Browser / Demo Storefront
          |
          v
    JavaScript Tracker
          |
          | Page views and clicks
          v
    Express REST API
        (Render)
          |
          | Validation and persistence
          v
      MongoDB Atlas
          |
          | Session and event queries
          v
   React Analytics Dashboard
        (Vercel)
```

### Data Flow

1. A visitor opens the demo storefront.
2. The tracking script records page views and click interactions.
3. Events are sent to the Express API.
4. The API validates incoming data and stores accepted events in MongoDB.
5. The dashboard retrieves session summaries, event journeys, and click data.
6. The interface visualizes the collected activity.

## Deployment

| Component | Platform | Link |
|---|---|---|
| Frontend dashboard | Vercel | [Open dashboard](https://signalpath-analytics.vercel.app/) |
| Backend API | Render | [Open backend](https://signalpath-api.onrender.com/) |
| API health | Render | [Check health](https://signalpath-api.onrender.com/api/health) |
| Database | MongoDB Atlas | Managed database |

The frontend uses `VITE_API_BASE_URL` to identify the backend API. The backend uses `MONGODB_URI` for database connectivity and `CLIENT_ORIGIN` to configure permitted browser origins.

## Getting Started Locally

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB running locally or a MongoDB Atlas database

### 1. Clone the repository

```bash
git clone https://github.com/pooj2123/signalpath-analytics.git
cd signalpath-analytics/causalfunnel-analytics
```

### 2. Configure the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your local settings:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/signalpath
CLIENT_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=300
```

The example URI assumes MongoDB is running locally. For MongoDB Atlas, use your own connection string.

**Never commit your real `.env` file, database password, or connection URI to GitHub.**

### 3. Start the backend

From the `server` directory:

```bash
npm run dev
```

The API should run at `http://localhost:4000`.

Check its health at `http://localhost:4000/api/health`.

### 4. Start the frontend

Open a second terminal from the `causalfunnel-analytics` directory:

```bash
cd client
npm install
npm run dev
```

The Vite development server should run at `http://localhost:5173`.

If the development proxy is configured, frontend API requests can be routed to the backend on port 4000.

### 5. Generate analytics

1. Open `http://localhost:5173/demo`.
2. Interact with the demo storefront.
3. Return to the dashboard.
4. Explore recorded sessions, user journeys, and click heatmap data.

Events appear only when tracking requests succeed and the backend can persist them.

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Reports API and database health |
| `POST` | `/api/events` | Ingests an event or a batch of events |
| `GET` | `/api/sessions` | Retrieves session summaries and activity counts |
| `GET` | `/api/sessions/:sessionId/events` | Retrieves a session's chronological event journey |
| `GET` | `/api/heatmap/pages` | Lists pages with recorded click events |
| `GET` | `/api/heatmap/clicks?url=...` | Retrieves click coordinates for a page |

## Tracking Another Webpage

For local development, include the tracking script in a webpage:

```html
<script
  src="http://localhost:4000/tracker.js"
  data-endpoint="http://localhost:4000/api/events"
  defer
></script>
```

The backend serves the tracking script at `/tracker.js`.

For a deployed webpage, use the HTTPS URL of the deployed tracker and API. Configure `CLIENT_ORIGIN` to allow the relevant website origin.

## Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | Local MongoDB fallback |
| `CLIENT_ORIGIN` | Comma-separated list of allowed browser origins | `http://localhost:5173` |
| `RATE_LIMIT_MAX` | Request limit per 15-minute window | `300` |
| `VITE_API_BASE_URL` | Frontend's backend API base URL | Configured for the frontend environment |

Configure production values in the hosting platform's environment settings rather than hardcoding credentials in source files.

## Data Model

Each event document contains:

- `sessionId` — browser session identifier
- `type` — event type, such as `page_view` or `click`
- `pageUrl` — URL associated with the event
- `timestamp` — validated event timestamp
- `coordinates` — optional click coordinates `{ x, y }`
- `viewport` — optional viewport dimensions `{ width, height }`

The API validates client-supplied timestamps and normalizes them to ISO dates. Coordinates are viewport-relative, providing a simple basis for click visualization.

## Design Decisions and Trade-offs

- **Lightweight session identity:** Sessions are associated with a browser using local storage and a cookie fallback, rather than authenticated user identity.
- **Viewport-relative coordinates:** The heatmap uses viewport-relative click positions and is not DOM-aware or scroll-position-normalized.
- **Privacy-conscious tracking:** The tracker does not collect form contents or keystrokes.
- **Server-side analytics:** MongoDB indexes and aggregation pipelines support common session and page queries.
- **Modular architecture:** Tracking, API routes, persistence, and dashboard rendering are separated to keep the implementation understandable.

## Project Structure

```text
causalfunnel-analytics/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
└── render.yaml
```

## Security and Limitations

SignalPath is an assignment and demonstration project, not a fully hardened production analytics service.

Before broader production use, consider adding:

- Authentication and authorization for dashboard access
- Consent handling and privacy controls appropriate to the deployment
- Configurable event retention and deletion policies
- Database backups and recovery procedures
- Automated testing and additional operational monitoring
- Improved heatmap normalization for scrolling and varying viewport sizes

The application uses environment variables for database credentials, CORS restrictions for browser origins, and rate limiting to mitigate some common risks. These controls do not replace a comprehensive production security review.

## Troubleshooting

### MongoDB connection fails

- Verify `MONGODB_URI`.
- Check the database username and password.
- Confirm MongoDB Atlas network access rules permit the backend to connect.
- Review Render logs for connection errors.

### Dashboard reports that the API is unavailable

- Check the [API health endpoint](https://signalpath-api.onrender.com/api/health).
- Verify `VITE_API_BASE_URL`.
- Check the backend's `CLIENT_ORIGIN` configuration and browser console for CORS errors.

### No sessions appear

- Open the demo storefront and interact with it.
- Confirm that the event ingestion request succeeds.
- Verify that MongoDB is connected and events are being persisted.

### CORS errors occur

- Add the exact permitted origin, including the scheme and hostname, to `CLIENT_ORIGIN`.
- Save the environment variable and restart or redeploy the backend.

---

**Project:** SignalPath — User Behavior Analytics Platform  
**Live Demo:** [signalpath-analytics.vercel.app](https://signalpath-analytics.vercel.app/)  
**Source Code:** [github.com/pooj2123/signalpath-analytics](https://github.com/pooj2123/signalpath-analytics)

Built to demonstrate full-stack engineering across browser tracking, REST API development, database persistence, analytics visualization, and cloud deployment.

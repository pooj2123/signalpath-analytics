import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Demo from './Demo';
import { Activity, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronRight, CircleHelp, Clock3, MousePointer2, RefreshCw, ScanSearch, Users, Waves } from 'lucide-react';
import { api, HeatClick, JourneyEvent, Session } from './api';

type Tab = 'sessions' | 'heatmap';
const shortId = (id: string) => id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-5)}` : id;
const dateTime = (value: string) => new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const time = (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function App() {
  if (window.location.pathname === '/demo') return <Demo />;
  const [tab, setTab] = useState<Tab>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState('');
  const [events, setEvents] = useState<JourneyEvent[]>([]);
  const [pages, setPages] = useState<{ url: string; clicks: number }[]>([]);
  const [page, setPage] = useState('');
  const [clicks, setClicks] = useState<HeatClick[]>([]);
  const [health, setHealth] = useState<'loading' | 'ok' | 'offline'>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setError('');
    try {
      const [healthResult, sessionResult, pageResult] = await Promise.all([api.health(), api.sessions(), api.pages()]);
      setHealth(healthResult.database === 'connected' ? 'ok' : 'offline');
      setSessions(sessionResult.sessions);
      setPages(pageResult.pages);
      if (!page && pageResult.pages[0]) setPage(pageResult.pages[0].url);
      if (!selected && sessionResult.sessions[0]) setSelected(sessionResult.sessions[0].sessionId);
    } catch (e) {
      setHealth('offline');
      setError(e instanceof Error ? e.message : 'Unable to connect to the API.');
    }
  }, [page, selected]);

  useEffect(() => { loadOverview(); }, []); // initial load only
  useEffect(() => {
    if (!selected) { setEvents([]); return; }
    let alive = true;
    setLoading(true);
    api.events(selected).then(result => { if (alive) setEvents(result.events); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Could not load journey.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [selected]);
  useEffect(() => {
    if (!page) { setClicks([]); return; }
    let alive = true;
    api.clicks(page).then(result => { if (alive) setClicks(result.clicks); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Could not load heatmap.'); });
    return () => { alive = false; };
  }, [page]);

  const totalEvents = useMemo(() => sessions.reduce((sum, s) => sum + s.totalEvents, 0), [sessions]);
  const totalClicks = useMemo(() => pages.reduce((sum, p) => sum + p.clicks, 0), [pages]);
  const selectedSession = sessions.find(s => s.sessionId === selected);

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="SignalPath home"><span className="brand-mark"><Waves size={21}/></span><span>signal<span className="brand-light">path</span><small>PRODUCT ANALYTICS</small></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <button className={`nav-item ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}><Users size={18}/> Sessions <ChevronRight className="nav-chevron" size={15}/></button>
      <button className={`nav-item ${tab === 'heatmap' ? 'active' : ''}`} onClick={() => setTab('heatmap')}><ScanSearch size={18}/> Click heatmap <ChevronRight className="nav-chevron" size={15}/></button>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-icon"><CircleHelp size={17}/></span><strong>Getting started</strong><p>Generate activity on the demo page to populate your analytics.</p><a href="/demo">Open demo site <ArrowUpRight size={13}/></a></div>
        <div className="profile"><div className="avatar">SP</div><div><strong>SignalPath demo</strong><small>Local workspace</small></div><span className={`status-dot ${health === 'ok' ? 'green' : 'muted'}`}/></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{tab === 'sessions' ? 'Sessions' : 'Click heatmap'}</strong></div><div className="top-actions"><span className={`connection ${health === 'ok' ? 'connected' : ''}`}><span className="status-dot"/> {health === 'ok' ? 'API connected' : health === 'loading' ? 'Checking API' : 'API unavailable'}</span><button className="icon-button" title="Refresh data" onClick={loadOverview}><RefreshCw size={16}/></button></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">BEHAVIOR OVERVIEW</div><h1>{tab === 'sessions' ? 'Understand every journey.' : 'See where people click.'}</h1><p>{tab === 'sessions' ? 'Explore real browser sessions, one event at a time.' : 'A lightweight view of click activity across your pages.'}</p></div><a className="demo-button" href="/demo"><ArrowUpRight size={16}/> Open demo site</a></div>
        {error && <div className="alert"><span>{error}</span><button onClick={() => { setError(''); loadOverview(); }}>Try again</button></div>}
        <section className="metrics">
          <Metric icon={<Users size={18}/>} label="Tracked sessions" value={sessions.length.toLocaleString()} hint="Browser sessions" />
          <Metric icon={<Activity size={18}/>} label="Events collected" value={totalEvents.toLocaleString()} hint="Page views + clicks" />
          <Metric icon={<MousePointer2 size={18}/>} label="Recorded clicks" value={totalClicks.toLocaleString()} hint="Across tracked pages" />
          <Metric icon={<Clock3 size={18}/>} label="Latest activity" value={sessions[0] ? dateTime(sessions[0].lastSeen) : '—'} hint="Most recent session" />
        </section>
        <div className="section-tabs"><button className={tab === 'sessions' ? 'selected' : ''} onClick={() => setTab('sessions')}>Session explorer</button><button className={tab === 'heatmap' ? 'selected' : ''} onClick={() => setTab('heatmap')}>Click heatmap</button></div>
        {tab === 'sessions' ? <div className="session-layout">
          <section className="panel sessions-panel"><div className="panel-heading"><div><h2>Recent sessions</h2><p>Latest activity first · up to 200 sessions</p></div><span className="count-pill">{sessions.length}</span></div>
            {sessions.length ? <div className="table-wrap"><table><thead><tr><th>SESSION</th><th>EVENTS</th><th>PAGES</th><th>LAST ACTIVE</th></tr></thead><tbody>{sessions.map(s => <tr key={s.sessionId} className={selected === s.sessionId ? 'row-selected' : ''} onClick={() => setSelected(s.sessionId)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelected(s.sessionId)}><td><span className="session-code">{shortId(s.sessionId)}</span><small>Started {dateTime(s.firstSeen)}</small></td><td><strong>{s.totalEvents}</strong></td><td>{s.pageCount}</td><td>{dateTime(s.lastSeen)}<ChevronRight size={14} className="row-arrow"/></td></tr>)}</tbody></table></div> : <Empty title="No sessions yet" detail="Open the demo site and interact with a few elements. Events will appear here." />}
          </section>
          <section className="panel journey-panel"><div className="panel-heading"><div><h2>User journey</h2><p>{selectedSession ? shortId(selectedSession.sessionId) : 'Choose a session to inspect'}</p></div><span className="journey-count">{events.length} events</span></div>
            {loading ? <div className="empty-state">Loading journey…</div> : events.length ? <div className="timeline">{events.map((event, i) => <div className="timeline-item" key={event.id}><div className={`event-symbol ${event.type}`}><span>{event.type === 'page_view' ? <ScanSearch size={15}/> : <MousePointer2 size={15}/>}</span></div><div className="event-body"><div className="event-title">{event.type === 'page_view' ? 'Page viewed' : 'Element clicked'}<time>{time(event.timestamp)}</time></div><div className="event-url">{event.page_url}</div>{event.type === 'click' && <div className="coordinate">Position · x {event.x}, y {event.y}</div>}</div></div>)}</div> : <Empty title="No events in this journey" detail="Select another session or create activity on the demo site." />}
          </section>
        </div> : <section className="panel heatmap-panel"><div className="panel-heading heatmap-heading"><div><h2>Click activity map</h2><p>Dots represent viewport-relative click positions for the selected URL.</p></div><label className="page-select-label">PAGE URL<select value={page} onChange={e => setPage(e.target.value)}><option value="">Choose a page…</option>{pages.map(p => <option value={p.url} key={p.url}>{p.url}</option>)}</select></label></div>
          {page ? <><div className="heatmap-meta"><span><span className="legend-dot"/> {clicks.length} clicks shown</span><span>Coordinates normalized to the recorded viewport</span></div><div className="heatmap-canvas" aria-label="Click heatmap visualization"><div className="canvas-watermark"><span>PAGE INTERACTION MAP</span><strong>{new URL(page).pathname || '/'}</strong><small>Dots indicate where clicks occurred</small></div>{clicks.map((c, i) => <span key={`${c.timestamp}-${i}`} className="heat-dot" title={`x: ${c.x}, y: ${c.y}`} style={{ left: `${Math.min(99, Math.max(1, c.x / c.width * 100))}%`, top: `${Math.min(99, Math.max(1, c.y / c.height * 100))}%`, opacity: Math.max(.3, 1 - i / Math.max(clicks.length, 1) * .55) }} />)}{!clicks.length && <div className="canvas-empty">No click data for this page yet.</div>}</div><p className="heatmap-note"><CircleHelp size={14}/> This is a viewport overlay, not a screenshot of the original page. Repeated clicks may overlap.</p></> : <Empty title="No click pages yet" detail="Visit the demo site and click around to create your first heatmap." />}
        </section>}
        <footer className="footer"><span>SignalPath Analytics <span className="footer-dot">·</span> Built for clarity</span><span>Event data refreshes when you press <RefreshCw size={11}/>.</span></footer>
      </div>
    </main>
  </div>;
}
function Metric({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-hint"><ArrowDownRight size={13}/></span></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{hint}</div></div>;
}
function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><div className="empty-icon"><Activity size={20}/></div><strong>{title}</strong><p>{detail}</p></div>;
}

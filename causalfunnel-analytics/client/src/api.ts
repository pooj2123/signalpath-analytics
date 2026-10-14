export type Session = {
  sessionId: string; totalEvents: number; firstSeen: string; lastSeen: string; pageCount: number;
};
export type JourneyEvent = {
  id: string; session_id: string; type: 'page_view' | 'click'; page_url: string;
  timestamp: string; x?: number; y?: number; viewport?: { width: number; height: number };
};
export type HeatClick = { x: number; y: number; width: number; height: number; timestamp: string };

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}
export const api = {
  health: () => request<{ status: string; database: string }>('/api/health'),
  sessions: () => request<{ sessions: Session[] }>('/api/events/sessions'),
  events: (id: string) => request<{ events: JourneyEvent[] }>(`/api/events/sessions/${encodeURIComponent(id)}/events`),
  pages: () => request<{ pages: { url: string; clicks: number }[] }>('/api/events/heatmap/pages'),
  clicks: (url: string) => request<{ clicks: HeatClick[] }>(`/api/events/heatmap/clicks?url=${encodeURIComponent(url)}`)
};

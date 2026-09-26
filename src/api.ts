import type { DashboardData, EntityConfig } from './types';

const API_BASE = 'https://others-api.odpay.in';

export interface LoginResponse {
  token: string;
  name: string;
  entityGroup: Array<{
    entityId: string;
    name: string;
    displayName: string;
    qac: string;
    entityType: string;
    logo?: string;
  }>;
}

export async function login(mobile: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, password }),
  });
  const json = await res.json();
  if (!json.token) throw new Error(json.message || 'Login failed');
  return json as LoginResponse;
}

export async function fetchDashboard(
  token: string,
  entityId: string,
  session: string
): Promise<DashboardData> {
  const url = `${API_BASE}/api/getSISDashboard/dashboard?entity=${encodeURIComponent(entityId)}&session=${encodeURIComponent(session)}`;
  const res = await fetch(url, { headers: { Authorization: token } });
  const json = await res.json();
  if (json.message) throw new Error(json.message);
  return json as DashboardData;
}

export async function fetchAllDashboards(
  token: string,
  entities: EntityConfig[],
  session: string,
  onProgress: (entityId: string, result: DashboardData | null, error: string | null) => void,
  batchSize = 10
): Promise<void> {
  for (let i = 0; i < entities.length; i += batchSize) {
    const batch = entities.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async entity => {
        try {
          const data = await fetchDashboard(token, entity.id, session);
          onProgress(entity.id, data, null);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed';
          onProgress(entity.id, null, msg);
        }
      })
    );
  }
}

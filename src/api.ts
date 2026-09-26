import type { DashboardData, EntityConfig } from './types';

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

export async function login(): Promise<LoginResponse> {
  const res = await fetch('/api/login', { method: 'POST' });
  const json = await res.json();
  if (!json.token) throw new Error(json.message || 'Login failed');
  return json as LoginResponse;
}

export async function fetchDashboard(
  token: string,
  entityId: string,
  session: string
): Promise<DashboardData> {
  const params = new URLSearchParams({ entity: entityId, session, token });
  const res = await fetch(`/api/dashboard?${params}`);
  const json = await res.json();
  if (json.message && !json.headCount) throw new Error(json.message);
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

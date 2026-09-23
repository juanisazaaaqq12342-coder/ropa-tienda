export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { ...options, credentials: 'include', headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers } });
  if (!response.ok) { const error = await response.json().catch(() => null); throw new Error(error?.message || 'No pudimos completar la solicitud. Intenta de nuevo.'); }
  return response.json() as Promise<T>;
}
export async function serverApi<T>(path: string): Promise<T> {
  const response = await fetch(`${process.env.API_URL || 'http://127.0.0.1:4000'}/api/v1${path}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('La boutique no está disponible en este momento.');
  return response.json() as Promise<T>;
}

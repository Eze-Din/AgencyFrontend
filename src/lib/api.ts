import type { ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!BASE_URL) {
  // Non-fatal: we keep running, but calls will fail until env is set.
  // This helps surface configuration issues early during development.
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE_URL is not defined. Configure it in your .env file.');
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL ?? ''}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const resp = await fetch(url, { ...options, headers });

  const text = await resp.text();
  const ct = resp.headers.get('content-type') || '';
  let json: any = undefined;
  if (ct.includes('application/json')) {
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch (e) {
      if (!resp.ok) throw new ApiError('Invalid JSON response', resp.status, text);
      // For OK responses with invalid JSON, return raw text
      return text as unknown as T;
    }
  } else {
    // Non-JSON response
    if (!resp.ok) throw new ApiError(text || `HTTP ${resp.status}`, resp.status, text);
    return text as unknown as T;
  }

  if (!resp.ok) {
    const msg = (json && (json.message || json.error)) || `HTTP ${resp.status}`;
    throw new ApiError(msg, resp.status, json);
  }

  // Some endpoints may return plain arrays or objects rather than ApiResponse
  return (json as ApiResponse<T>).data ?? (json as T);
}

export const api = {
  // Auth
  login: (payload: { username: string; password: string }) =>
    request('/login', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (payload: { username: string; forgot_key: string; new_password: string; confirm_password?: string }) =>
    request('/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Users
  createUser: (payload: { username: string; password: string; role: string; forgot_key: string }) =>
    request('/users/create', { method: 'POST', body: JSON.stringify(payload) }),
  listUsers: (query?: Record<string, string | number | boolean>) =>
    request(`/users${toQuery(query)}`),
  updateUser: (username: string, payload: { password?: string; role?: string; forgot_key?: string }) =>
    request(`/users/update/${encodeURIComponent(username)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (username: string) => request(`/users/delete/${encodeURIComponent(username)}`, { method: 'DELETE' }),

  // Applicants
  createApplicant: (payload: any) => request('/applicants/create', { method: 'POST', body: JSON.stringify(payload) }),
  listApplicants: (query?: Record<string, string | number | boolean>) => request(`/applicants${toQuery(query)}`),
  updateApplicant: (identifier: string, payload: any) => request(`/applicants/update/${encodeURIComponent(identifier)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteApplicant: (id: number | string) => request(`/applicants/delete/${id}`, { method: 'DELETE' }),
  toggleActive: (id: number | string) => request(`/applicants/${id}/`, { method: 'POST' }),

  // Selection
  selectApplicant: (applicantId: number | string, userId: number | string) =>
    request(`/selection/${applicantId}/`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),

  // Partners
  listPartners: () => request('/partners'),

  // Metrics
  totalApplicants: () => request('/total-applicants/'),
  selectedApplicants: () => request('/selected-applicants/'),
  selectedByUser: (userId: number | string) => request(`/selected-by-user/${userId}`),
  activeInactiveApplicants: () => request('/active-inactive-applicants'),
};

function toQuery(query?: Record<string, string | number | boolean>) {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => params.append(k, String(v)));
  const s = params.toString();
  return s ? `?${s}` : '';
}

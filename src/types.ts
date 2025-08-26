// Shared application types for API responses, auth, and domain models

export type Role = 'admin' | 'user'; // 'admin' => Owner, 'user' => Partner

export interface User {
  id?: number;
  username: string;
  role: Role;
}

export interface Auth {
  user: User;
  token?: string;
}

// Many endpoints appear to follow a { status, message, data } shape.
// Keep index signature flexible to tolerate endpoints that return extra fields
// or do not wrap results in `data`.
export interface ApiResponse<T = unknown> {
  status?: 'success' | 'error' | string;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Minimal applicant shape used in lists; will be expanded during integration
export interface Applicant {
  id?: number;
  application_no?: string;
  full_name?: string;
  gender?: string;
  phone_no?: string;
  is_active?: boolean;
  is_selected?: boolean;
  selected_by?: number | null;
  [key: string]: any;
}

// Dashboard metrics
export interface MetricsCounts {
  totalApplicants?: number;
  selectedApplicants?: number;
  activeCount?: number;
  inactiveCount?: number;
}

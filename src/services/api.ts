// src/services/api.ts
export interface ApiResponse {
  status?: string;
  code?: number;
  message?: string;
  [key: string]: any;
}

export async function postData(url: string, data: object) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let json: ApiResponse = {};
  try {
    json = await response.json();
  } catch {}

  return { status: response.status, ...json };
}

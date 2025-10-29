import { API_CONFIG } from './api.config';
import storageService from './storage.service';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (requiresAuth) {
      const token = await storageService.getOperatorToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async get<T>(endpoint: string, params?: Record<string, any>, requiresAuth = false): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' }, requiresAuth);
  }

  async post<T>(endpoint: string, body: any, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }, requiresAuth);
  }
}

export default new ApiClient();

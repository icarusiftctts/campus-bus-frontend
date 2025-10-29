// HTTP Client with authentication and error handling
import { API_CONFIG } from './api.config';
import { ApiError } from './api.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get stored auth token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store auth token
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Clear auth token
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        requiresAuth: boolean = true
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (requiresAuth) {
            const token = await this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // NEW: Handle API Gateway Lambda proxy response format
            let data;
            try {
                const rawData = await response.json();

                // Check if this is API Gateway format with statusCode and body
                if (rawData.statusCode && rawData.body) {
                    // Parse the body string
                    data = typeof rawData.body === 'string'
                        ? JSON.parse(rawData.body)
                        : rawData.body;

                    // Use Lambda's statusCode for error checking
                    if (rawData.statusCode >= 400) {
                        const error: ApiError = {
                            message: data.message || data.error || 'Request failed',
                            statusCode: rawData.statusCode,
                        };
                        throw error;
                    }
                } else {
                    // Direct response (not API Gateway format)
                    data = rawData;

                    if (!response.ok) {
                        const error: ApiError = {
                            message: data.message || data.error || 'Request failed',
                            statusCode: response.status,
                        };
                        throw error;
                    }
                }
            } catch (parseError: any) {
                if (parseError.statusCode) throw parseError; // Re-throw API errors
                throw { message: 'Invalid response format', statusCode: 500 } as ApiError;
            }

            return data as T;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw { message: 'Request timeout', statusCode: 408 } as ApiError;
            }

            throw error as ApiError;
        }
    }


  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>, requiresAuth: boolean = true): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' }, requiresAuth);
  }

  // POST request
  async post<T>(endpoint: string, body?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      requiresAuth
    );
  }

  // PUT request
  async put<T>(endpoint: string, body?: any, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      requiresAuth
    );
  }

  // DELETE request
  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }
}

export default new ApiClient();

// Authentication Service
// Connects to: RegisterUserHandler, LoginUserHandler

import apiClient from './api.client';
import { API_ENDPOINTS, API_CONFIG } from './api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageService from './storage.service';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
  CompleteProfileRequest,
  CompleteProfileResponse
} from './api.types';

class AuthService {
  private validateCollegeEmail(email: string): void {
    if (!email.toLowerCase().endsWith(API_CONFIG.ALLOWED_DOMAIN)) {
      throw new Error(`Only ${API_CONFIG.ALLOWED_DOMAIN} emails are allowed`);
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    this.validateCollegeEmail(data.email);
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      false // No auth required for registration
    );
    
    // Store token after successful registration
    if (response.token) {
      await apiClient.setToken(response.token);
    }
    
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    this.validateCollegeEmail(data.email);
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
      false
    );
    
    // Store token after successful login
    if (response.token) {
      await apiClient.setToken(response.token);
    }
    
    return response;
  }

  async googleAuth(data: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    this.validateCollegeEmail(data.email);
    const response = await apiClient.post<GoogleAuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE_AUTH,
      data,
      false
    );
    if (response.token) {
      await storageService.storeAuthData(response.token, response.studentId, response.email);
      await apiClient.setToken(response.token);
      if (!response.profileComplete) {
        await AsyncStorage.setItem('pendingProfile', JSON.stringify({
          studentId: response.studentId,
          name: response.name,
          email: response.email
        }));
      }
    }
    return response;
  }

  async completeProfile(data: CompleteProfileRequest): Promise<CompleteProfileResponse> {
    return await apiClient.put<CompleteProfileResponse>(
      API_ENDPOINTS.AUTH.COMPLETE_PROFILE,
      data,
      true
    );
  }

  async getPendingProfileData(): Promise<any> {
    const data = await AsyncStorage.getItem('pendingProfile');
    return data ? JSON.parse(data) : null;
  }

  async clearPendingProfileData(): Promise<void> {
    await AsyncStorage.removeItem('pendingProfile');
  }

  async validateAndGetProfile(): Promise<any> {
    return await apiClient.get<any>(API_ENDPOINTS.AUTH.PROFILE, undefined, true);
  }

  async logout(): Promise<void> {
    await storageService.clearAuthData();
    await apiClient.clearToken();
    await this.clearPendingProfileData();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getToken();
    return !!token;
  }

  async getToken(): Promise<string | null> {
    return await apiClient.getToken();
  }
}

export default new AuthService();

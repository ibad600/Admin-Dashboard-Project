import apiClient from './api';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

export const authService = {
  /**
   * Log in user with username & password via DummyJSON API
   * Endpoint: POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password.trim(),
      expiresInMins: 120,
    });
    return response.data;
  },

  /**
   * Get current authenticated user details
   * Endpoint: GET /auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

export default authService;

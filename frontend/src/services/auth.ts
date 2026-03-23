import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro';
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const authService = {
  async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data);

      if (response.data?.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }

      return response.data;

    } catch (error: any) {
      console.error('Login failed:', error?.response?.data || error.message);
      throw error?.response?.data || { error: 'Login failed' };
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data);

      if (response.data?.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }

      return response.data;

    } catch (error: any) {
      console.error('Register failed:', error?.response?.data || error.message);
      throw error?.response?.data || { error: 'Registration failed' };
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('Profile fetch failed:', error?.response?.data || error.message);

      // 🔥 Auto logout if token invalid
      if (error?.response?.status === 401) {
        this.logout();
      }

      throw error;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
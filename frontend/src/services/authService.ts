import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    agencyId: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    agency?: {
      id: string;
      name: string;
      code: string;
    };
  };
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Even if the server logout fails, we should still clear local storage
      console.warn('Server logout failed, but clearing local storage:', error);
    }
  },

  async getCurrentUser(): Promise<{ user: LoginResponse['user'] }> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async changePassword(passwords: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.put('/api/auth/change-password', passwords);
    return response.data;
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<{ message: string; user: LoginResponse['user'] }> {
    const response = await api.put('/api/auth/update-profile', profileData);
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },
}; 
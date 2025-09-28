import { LoginCredentials, AuthResponse, RefreshResponse, User } from '@/types/auth';
import { API_BASE_URL, ENDPOINTS, TOKEN_EXPIRY_TIME } from '@/lib/constants';

class AuthService {
  private baseURL = API_BASE_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>(ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    return this.request<RefreshResponse>(ENDPOINTS.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    return this.request<User>(ENDPOINTS.ME, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async updateUser(accessToken: string, userData: Partial<User>): Promise<User> {
    return this.request<User>(ENDPOINTS.ME, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });
  }

  // Guardar tokens en localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', (Date.now() + TOKEN_EXPIRY_TIME).toString());
    }
  }

  // Obtener tokens
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  // Verificar si el token está expirado
  isTokenExpired(): boolean {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem('tokenExpiry');
      return expiry ? Date.now() > parseInt(expiry) : true;
    }
    return true;
  }

  // Limpiar tokens
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    }
  }

  // Obtener token válido (con refresh si es necesario)
  async getValidToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    // Si el token no está expirado, devolverlo directamente
    if (!this.isTokenExpired()) {
      return accessToken;
    }

    // Si está expirado, intentar refrescar
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.clearTokens();
        return null;
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.refreshToken(refreshToken);
      this.setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }
}

export const authService = new AuthService();
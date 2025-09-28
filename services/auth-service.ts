import { LoginCredentials, AuthResponse, RefreshResponse, User } from '@/types/auth';

// Datos mock para todos los entornos
const mockUsers = [
  {
    id: '1',
    name: 'Gabriela Aguilar',
    email: 'gabriela.aguilar@linktic.com',
    password: 'password123',
    createdAt: '2025-09-28T09:37:00-05:00',
  },
  {
    id: '2', 
    name: 'Oury Santacruz',
    email: 'oury.santacruz@linktic.com',
    password: 'password',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '3', 
    name: 'Usuario Prueba',
    email: 'prueba@linktic.com',
    password: 'password',
    createdAt: '2024-01-15T10:30:00Z',
  },
];

// Estado en memoria para simular base de datos
let currentUser = { ...mockUsers[0] };
let usersDatabase = [...mockUsers];

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = usersDatabase.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      currentUser = { ...user };
      
      const response = {
        accessToken: 'mock-access-token-123',
        refreshToken: 'mock-refresh-token-456',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
      };
      
      this.setTokens(response.accessToken, response.refreshToken);
      return response;
    }
    
    throw new Error('Credenciales inválidas');
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = {
      accessToken: 'new-mock-access-token-789',
      refreshToken: 'new-mock-refresh-token-012',
    };
    
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verificar token (simulado)
    if (!this.isValidToken(accessToken)) {
      throw new Error('Token inválido');
    }
    
    return {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      createdAt: currentUser.createdAt
    };
  }

  async updateUser(accessToken: string, userData: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.isValidToken(accessToken)) {
      throw new Error('Token inválido');
    }
    
    // Actualizar usuario actual
    currentUser = {
      ...currentUser,
      ...userData
    };
    
    // Actualizar en la "base de datos"
    const userIndex = usersDatabase.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      usersDatabase[userIndex] = {
        ...usersDatabase[userIndex],
        ...userData
      };
    }
    
    return {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      createdAt: currentUser.createdAt
    };
  }

  // Métodos de almacenamiento en localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', (Date.now() + (15 * 60 * 1000)).toString()); // 15 minutos
    }
  }

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

  isTokenExpired(): boolean {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem('tokenExpiry');
      return expiry ? Date.now() > parseInt(expiry) : true;
    }
    return true;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    }
  }

  async getValidToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    // Si el token no está expirado, devolverlo
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

  // Método auxiliar para validar token (simulado)
  private isValidToken(token: string): boolean {
    const validTokens = [
      'mock-access-token-123',
      'new-mock-access-token-789'
    ];
    return validTokens.includes(token);
  }

  // Método para resetear datos (útil para testing)
  resetMockData(): void {
    currentUser = { ...mockUsers[0] };
    usersDatabase = [...mockUsers];
    this.clearTokens();
  }
}

export const authService = new AuthService();
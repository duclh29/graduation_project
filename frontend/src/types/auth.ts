export interface UserProfile {
  userId: number;
  email: string;
  roles: string[];
}

export interface AuthPayload {
  userId: number;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  email: string;
  roles: string[];
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

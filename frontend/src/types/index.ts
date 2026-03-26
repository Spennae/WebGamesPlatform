export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface Score {
  id: number;
  userId: number;
  username: string;
  value: number;
  recordedAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ScoreRequest {
  gameSlug: string;
  value: number;
}

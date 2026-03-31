import type { User, Game, Score, AuthResponse, RegisterRequest, LoginRequest, ScoreRequest, Feedback, SubmitFeedbackRequest, UpdateFeedbackStatusRequest } from '../types';
import api from './api';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },
};

export const gameService = {
  getGames: async (): Promise<Game[]> => {
    const response = await api.get<Game[]>('/api/games');
    return response.data;
  },

  getGame: async (slug: string): Promise<Game> => {
    const response = await api.get<Game>(`/api/games/${slug}`);
    return response.data;
  },
};

export const scoreService = {
  submitScore: async (data: ScoreRequest): Promise<Score> => {
    const response = await api.post<Score>('/api/scores', data);
    return response.data;
  },

  getScores: async (gameSlug: string, limit = 10): Promise<Score[]> => {
    const response = await api.get<Score[]>(`/api/scores/${gameSlug}?limit=${limit}`);
    return response.data;
  },
};

export const feedbackService = {
  submitFeedback: async (data: SubmitFeedbackRequest): Promise<Feedback> => {
    const response = await api.post<Feedback>('/api/feedback', data);
    return response.data;
  },

  getAllFeedback: async (): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>('/api/feedback');
    return response.data;
  },

  updateFeedbackStatus: async (id: number, data: UpdateFeedbackStatusRequest): Promise<Feedback> => {
    const response = await api.patch<Feedback>(`/api/feedback/${id}/status`, data);
    return response.data;
  },
};

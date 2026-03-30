export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
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
  isAdmin: boolean;
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

export const FeedbackType = {
  Bug: 0,
  Feedback: 1,
} as const;

export type FeedbackType = typeof FeedbackType[keyof typeof FeedbackType];

export const FeedbackStatus = {
  Open: 0,
  InProgress: 1,
  Resolved: 2,
  Closed: 3,
} as const;

export type FeedbackStatus = typeof FeedbackStatus[keyof typeof FeedbackStatus];

export interface Feedback {
  id: number;
  userId: number;
  username: string;
  type: FeedbackType;
  status: FeedbackStatus;
  title: string;
  description: string;
  createdAt: string;
}

export interface SubmitFeedbackRequest {
  type: FeedbackType;
  title: string;
  description: string;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

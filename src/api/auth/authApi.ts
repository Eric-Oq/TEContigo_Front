// src/api/authApi.ts
import { request } from './client';

// Interfaces for each DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
}

export interface RegisterRequest {
  controlNumber: number;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  password: string;
}

export interface RegisterModeratorRequest extends RegisterRequest {
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface MessageResponse {
  message: string;
}

// Object authApi has methods for do a fetch
export const authApi = {
  login: (payload: LoginRequest) =>
    request<LoginResponse>('/api/Auth/login', {
      method: 'POST',
      body: payload,
    }),

  register: (payload: RegisterRequest) =>
    request<MessageResponse>('/api/Auth/register', {
      method: 'POST',
      body: payload,
    }),

  registerModerator: (payload: RegisterModeratorRequest) =>
    request<MessageResponse>('/api/Auth/register/moderator', {
      method: 'POST',
      body: payload,
    }),

  verifyEmail: (payload: VerifyEmailRequest) =>
    request<MessageResponse>('/api/Auth/verify-email', {
      method: 'POST',
      body: payload,
    }),

  resendCode: (payload: ResendCodeRequest) =>
    request<MessageResponse>('/api/Auth/resend-code', {
      method: 'POST',
      body: payload,
    }),

  refresh: (payload: RefreshTokenRequest) =>
    request<LoginResponse>('/api/Auth/refresh', {
      method: 'POST',
      body: payload,
    }),

  logout: (payload: RefreshTokenRequest) =>
    request<MessageResponse>('/api/Auth/logout', {
      method: 'POST',
      body: payload,
    }),
};
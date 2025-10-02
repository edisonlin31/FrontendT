import type { UserDto } from './user';

// Base API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Authentication Response
export interface AuthResponse {
  user: UserDto;
  token: string;
}
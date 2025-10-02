// User DTO from backend
export interface UserDto {
  _id: string;
  username: string;
  email: string;
  role: 'L1' | 'L2' | 'L3';
  createdAt?: string;
  updatedAt?: string;
}
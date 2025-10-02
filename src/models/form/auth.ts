// Login Form Data
export interface LoginForm {
  email: string;
  password: string;
}

// Register Form Data
export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  role: 'L1' | 'L2' | 'L3';
}
import client from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: string
}

export const authAPI = {
  login: (data: LoginRequest) => client.post<TokenResponse>('/auth/login', data),
  getMe: () => client.get<User>('/auth/me'),
}

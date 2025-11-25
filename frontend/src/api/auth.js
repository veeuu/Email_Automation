import client from './client'

export const authAPI = {
  login: (data) => client.post('/auth/login', data),
  getMe: () => client.get('/auth/me'),
}

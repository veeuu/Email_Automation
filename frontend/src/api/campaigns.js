import client from './client'

export interface Campaign {
  id: string
  name: string
  template_id: string
  status: string
  send_rate: number
  created_at: string
}

export const campaignsAPI = {
  list: () => client.get<Campaign[]>('/campaigns'),
  create: (data: Omit<Campaign, 'id' | 'created_at'>) =>
    client.post<Campaign>('/campaigns', data),
  get: (id: string) => client.get<Campaign>(`/campaigns/${id}`),
  start: (id: string) => client.post(`/campaigns/${id}/start`),
  pause: (id: string) => client.post(`/campaigns/${id}/pause`),
  cancel: (id: string) => client.post(`/campaigns/${id}/cancel`),
  delete: (id: string) => client.delete(`/campaigns/${id}`),
  sendTest: (id: string, testEmail: string) =>
    client.post(`/campaigns/${id}/send_test`, { test_email: testEmail }),
}

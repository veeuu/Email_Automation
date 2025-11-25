import client from './client'

export const campaignsAPI = {
  list: () => client.get('/campaigns'),
  create: (data) => client.post('/campaigns', data),
  get: (id) => client.get(`/campaigns/${id}`),
  start: (id) => client.post(`/campaigns/${id}/start`),
  pause: (id) => client.post(`/campaigns/${id}/pause`),
  cancel: (id) => client.post(`/campaigns/${id}/cancel`),
  delete: (id) => client.delete(`/campaigns/${id}`),
  sendTest: (id, testEmail) =>
    client.post(`/campaigns/${id}/send_test`, { test_email: testEmail }),
}

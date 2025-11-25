import client from './client'

export const templatesAPI = {
  list: () => client.get('/templates'),
  create: (data) => client.post('/templates', data),
  get: (id) => client.get(`/templates/${id}`),
  update: (id, data) => client.put(`/templates/${id}`, data),
  delete: (id) => client.delete(`/templates/${id}`),
  deleteTemplate: (id) => client.delete(`/templates/${id}`),
}

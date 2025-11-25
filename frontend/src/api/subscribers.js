import client from './client'

export const subscribersAPI = {
  list: (page = 1, pageSize = 50, status) =>
    client.get('/subscribers', {
      params: { page, page_size: pageSize, status },
    }),
  
  get: (id) => client.get(`/subscribers/${id}`),
  
  bulkImport: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post('/subscribers/bulk_import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  unsubscribe: (id) => client.post(`/subscribers/${id}/unsubscribe`),
  
  delete: (id) => client.delete(`/subscribers/${id}`),
  
  export: () => client.get('/subscribers/export'),
}

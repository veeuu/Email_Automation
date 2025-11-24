import client from './client'

export interface Template {
  id: string
  name: string
  subject: string
  html: string
  text_content?: string
  version: number
  created_at: string
}

export const templatesAPI = {
  list: () => client.get<Template[]>('/templates'),
  create: (data: Omit<Template, 'id' | 'version' | 'created_at'>) =>
    client.post<Template>('/templates', data),
  get: (id: string) => client.get<Template>(`/templates/${id}`),
  update: (id: string, data: Partial<Template>) =>
    client.put<Template>(`/templates/${id}`, data),
  delete: (id: string) => client.delete(`/templates/${id}`),
}

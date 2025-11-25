import client from './client'

export interface Subscriber {
  id: string
  email: string
  name?: string
  status: string
  tags: Record<string, any>
  custom_fields: Record<string, any>
  created_at: string
}

export interface SubscriberDetail extends Subscriber {
  last_activity?: string
  events: Array<{
    event_type: string
    created_at: string
    metadata: Record<string, any>
  }>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ImportReport {
  import_id: string
  total_rows: number
  imported: number
  skipped: number
  errors: string[]
}

export const subscribersAPI = {
  list: (page: number = 1, pageSize: number = 50, status?: string) =>
    client.get<PaginatedResponse<Subscriber>>('/subscribers', {
      params: { page, page_size: pageSize, status },
    }),
  
  get: (id: string) => client.get<SubscriberDetail>(`/subscribers/${id}`),
  
  bulkImport: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post<ImportReport>('/subscribers/bulk_import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  unsubscribe: (id: string) => client.post(`/subscribers/${id}/unsubscribe`),
  
  delete: (id: string) => client.delete(`/subscribers/${id}`),
  
  export: () => client.get('/subscribers/export'),
}

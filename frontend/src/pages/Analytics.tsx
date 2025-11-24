import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import client from '@/api/client'

export default function Analytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => client.get('/analytics').then((res) => res.data),
  })

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Sent</h3>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? '-' : metrics?.totalSent || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Opened</h3>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? '-' : metrics?.totalOpened || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Clicked</h3>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? '-' : metrics?.totalClicked || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Unsubscribed</h3>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? '-' : metrics?.totalUnsubscribed || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
          <p className="text-gray-600">Analytics data will appear here</p>
        </div>
      </div>
    </Layout>
  )
}

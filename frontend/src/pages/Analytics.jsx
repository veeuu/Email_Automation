import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import client from '@/api/client'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => client.get('/analytics').then((res) => res.data),
  })

  const chartData = metrics ? [
    { name: 'Sent', value: metrics.totalSent || 0 },
    { name: 'Opened', value: metrics.totalOpened || 0 },
    { name: 'Clicked', value: metrics.totalClicked || 0 },
    { name: 'Unsubscribed', value: metrics.totalUnsubscribed || 0 },
  ] : []

  const performanceData = metrics ? [
    { name: 'Sent', value: metrics.totalSent || 0 },
    { name: 'Opened', value: metrics.totalOpened || 0 },
    { name: 'Clicked', value: metrics.totalClicked || 0 },
  ] : []

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  const openRate = metrics?.totalSent ? Math.round((metrics.totalOpened / metrics.totalSent) * 100) : 0
  const clickRate = metrics?.totalSent ? Math.round((metrics.totalClicked / metrics.totalSent) * 100) : 0
  const unsubscribeRate = metrics?.totalSent ? Math.round((metrics.totalUnsubscribed / metrics.totalSent) * 100) : 0

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
            <h3 className="text-gray-600 text-sm font-semibold">Open Rate</h3>
            <p className="text-3xl font-bold mt-2">{openRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{metrics?.totalOpened || 0} opened</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Click Rate</h3>
            <p className="text-3xl font-bold mt-2">{clickRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{metrics?.totalClicked || 0} clicked</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Unsubscribe Rate</h3>
            <p className="text-3xl font-bold mt-2">{unsubscribeRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{metrics?.totalUnsubscribed || 0} unsubscribed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Email Performance</h2>
            {!isLoading && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">Loading...</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Distribution</h2>
            {!isLoading && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">Loading...</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Campaign Funnel</h2>
          {!isLoading && performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">Loading...</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

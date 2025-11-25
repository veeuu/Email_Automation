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
    { name: 'Unsub', value: metrics.totalUnsubscribed || 0 },
  ] : []

  const performanceData = metrics ? [
    { name: 'Sent', value: metrics.totalSent || 0 },
    { name: 'Opened', value: metrics.totalOpened || 0 },
    { name: 'Clicked', value: metrics.totalClicked || 0 },
  ] : []

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

  const openRate = metrics?.totalSent ? Math.round((metrics.totalOpened / metrics.totalSent) * 100) : 0
  const clickRate = metrics?.totalSent ? Math.round((metrics.totalClicked / metrics.totalSent) * 100) : 0
  const unsubscribeRate = metrics?.totalSent ? Math.round((metrics.totalUnsubscribed / metrics.totalSent) * 100) : 0

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your campaign performance</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-indigo-600 text-xs font-semibold uppercase">Sent</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {metrics?.totalSent || 0}
                    </p>
                  </div>
                  <span className="text-lg">📧</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-green-600 text-xs font-semibold uppercase">Open Rate</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{openRate}%</p>
                    <p className="text-xs text-green-600 mt-0.5">{metrics?.totalOpened || 0} opened</p>
                  </div>
                  <span className="text-lg">👁️</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-blue-600 text-xs font-semibold uppercase">Click Rate</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{clickRate}%</p>
                    <p className="text-xs text-blue-600 mt-0.5">{metrics?.totalClicked || 0} clicked</p>
                  </div>
                  <span className="text-lg">🖱️</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-red-600 text-xs font-semibold uppercase">Unsub Rate</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{unsubscribeRate}%</p>
                    <p className="text-xs text-red-600 mt-0.5">{metrics?.totalUnsubscribed || 0} unsub</p>
                  </div>
                  <span className="text-lg">🚫</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg shadow-sm border border-purple-100">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Performance</h2>
                {!isLoading && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-600 text-center py-6 text-xs">No data</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg shadow-sm border border-amber-100">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Distribution</h2>
                {!isLoading && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={70}
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
                  <p className="text-gray-600 text-center py-6 text-xs">No data</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg shadow-sm border border-rose-100">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Funnel</h2>
              {!isLoading && performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600 text-center py-6 text-xs">No data</p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

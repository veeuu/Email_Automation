import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import { campaignsAPI } from '@/api/campaigns'
import { subscribersAPI } from '@/api/subscribers'

export default function Dashboard() {
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsAPI.list().then((res) => res.data),
  })

  const { data: subscribers, isLoading: subscribersLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => subscribersAPI.list(1, 1).then((res) => res.data),
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your marketing overview</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-blue-600 text-xs font-semibold uppercase tracking-wide">Subscribers</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {subscribersLoading ? '-' : subscribers?.total || 0}
                </p>
              </div>
              <span className="text-xl">👥</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-purple-600 text-xs font-semibold uppercase tracking-wide">Campaigns</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {campaignsLoading ? '-' : campaigns?.length || 0}
                </p>
              </div>
              <span className="text-xl">📧</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-green-600 text-xs font-semibold uppercase tracking-wide">Active</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {campaignsLoading ? '-' : campaigns?.filter((c) => c.status === 'sending').length || 0}
                </p>
              </div>
              <span className="text-xl">🚀</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-amber-600 text-xs font-semibold uppercase tracking-wide">Scheduled</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {campaignsLoading ? '-' : campaigns?.filter((c) => c.status === 'scheduled').length || 0}
                </p>
              </div>
              <span className="text-xl">⏰</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-6 border border-indigo-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Campaigns</h2>
            {campaignsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-2">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-indigo-50 transition-all border border-indigo-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{campaign.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          campaign.status === 'sending' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {campaign.status}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">No campaigns yet. Create one to get started!</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl shadow-sm p-6 border border-rose-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-rose-100">
                <p className="text-xs text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-rose-100">
                <p className="text-xs text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-rose-100">
                <p className="text-xs text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

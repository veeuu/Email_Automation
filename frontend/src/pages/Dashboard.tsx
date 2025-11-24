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
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Subscribers</h3>
            <p className="text-3xl font-bold mt-2">
              {subscribersLoading ? '-' : subscribers?.total || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Campaigns</h3>
            <p className="text-3xl font-bold mt-2">
              {campaignsLoading ? '-' : campaigns?.length || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Active Campaigns</h3>
            <p className="text-3xl font-bold mt-2">
              {campaignsLoading ? '-' : campaigns?.filter((c) => c.status === 'sending').length || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Scheduled</h3>
            <p className="text-3xl font-bold mt-2">
              {campaignsLoading ? '-' : campaigns?.filter((c) => c.status === 'scheduled').length || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
          {campaignsLoading ? (
            <p>Loading...</p>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-2">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex justify-between items-center p-3 border-b">
                  <div>
                    <p className="font-semibold">{campaign.name}</p>
                    <p className="text-sm text-gray-600">{campaign.status}</p>
                  </div>
                  <span className="text-sm text-gray-600">{campaign.created_at}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No campaigns yet</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

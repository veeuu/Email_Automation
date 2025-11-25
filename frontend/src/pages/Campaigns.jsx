import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { campaignsAPI } from '@/api/campaigns'
import { templatesAPI } from '@/api/templates'
import { useForm } from 'react-hook-form'

export default function Campaigns() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const { register, handleSubmit, reset } = useForm()

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsAPI.list().then((res) => res.data),
  })

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesAPI.list().then((res) => res.data),
  })

  const onSubmit = async (data) => {
    try {
      await campaignsAPI.create(data)
      setCreateModalOpen(false)
      reset()
      refetch()
    } catch (error) {
      console.error('Create campaign failed:', error)
    }
  }

  const handleStart = async (campaign) => {
    try {
      await campaignsAPI.start(campaign.id)
      refetch()
    } catch (error) {
      console.error('Failed to start campaign:', error)
    }
  }

  const handlePause = async (campaign) => {
    try {
      await campaignsAPI.pause(campaign.id)
      refetch()
    } catch (error) {
      console.error('Failed to pause campaign:', error)
    }
  }

  const handleSendTest = async () => {
    if (!selectedCampaign || !testEmail) return
    try {
      await campaignsAPI.sendTest(selectedCampaign.id, testEmail)
      setTestModalOpen(false)
      setTestEmail('')
      alert('Test email sent!')
    } catch (error) {
      console.error('Failed to send test:', error)
      alert('Failed to send test email')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'sending': return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage your email campaigns</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all font-medium text-sm"
          >
            + New
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm p-4 border border-purple-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{campaign.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Rate: {campaign.send_rate}/sec</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">{new Date(campaign.created_at).toLocaleDateString()}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign)
                      setTestModalOpen(true)
                    }}
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-all font-medium"
                  >
                    Test
                  </button>
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStart(campaign)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-all font-medium"
                    >
                      Start
                    </button>
                  )}
                  {campaign.status === 'sending' && (
                    <button
                      onClick={() => handlePause(campaign)}
                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-all font-medium"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this campaign?')) {
                        campaignsAPI.delete(campaign.id).then(() => refetch())
                      }
                    }}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-all font-medium ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-8 text-center border-2 border-dashed border-indigo-200">
            <p className="text-2xl mb-2">📧</p>
            <p className="text-gray-600 text-sm">No campaigns yet</p>
            <p className="text-gray-500 text-xs mt-1">Create your first campaign to get started</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={createModalOpen}
        title="Create Campaign"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
            >
              Create
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
            <input
              {...register('name', { required: true })}
              type="text"
              placeholder="Campaign name"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Template</label>
            <select
              {...register('template_id', { required: true })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            >
              <option value="">Select template</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Send Rate</label>
            <input
              {...register('send_rate', { required: true })}
              type="number"
              defaultValue={10}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={testModalOpen}
        title="Send Test"
        onClose={() => setTestModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setTestModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSendTest}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
            >
              Send
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Send a test email to verify</p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

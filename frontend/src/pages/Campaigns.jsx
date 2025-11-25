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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Campaign
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Send Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        campaign.status === 'sending' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{campaign.send_rate}/sec</td>
                    <td className="px-6 py-4 text-sm">{campaign.created_at}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign)
                          setTestModalOpen(true)
                        }}
                        className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        Test
                      </button>
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleStart(campaign)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Start
                        </button>
                      )}
                      {campaign.status === 'sending' && (
                        <button
                          onClick={() => handlePause(campaign)}
                          className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
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
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-600">No campaigns yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        title="Create Campaign"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Campaign Name
            </label>
            <input
              {...register('name', { required: true })}
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Template
            </label>
            <select
              {...register('template_id', { required: true })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select template</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Send Rate (emails/sec)
            </label>
            <input
              {...register('send_rate', { required: true })}
              type="number"
              defaultValue={10}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={testModalOpen}
        title="Send Test Email"
        onClose={() => setTestModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setTestModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSendTest}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Test
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">Send a test email to verify the campaign works</p>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import { useForm } from 'react-hook-form'
import client from '@/api/client'

export default function Automation() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: workflows, isLoading, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => client.get('/workflows').then((res) => res.data),
  })

  const onSubmit = async (formData) => {
    try {
      await client.post('/workflows', formData)
      setCreateModalOpen(false)
      reset()
      refetch()
    } catch (error) {
      console.error('Create workflow failed:', error)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'trigger', label: 'Trigger' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Automation</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Workflow
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={workflows || []}
            loading={isLoading}
          />
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        title="Create Workflow"
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
              Workflow Name
            </label>
            <input
              {...register('name', { required: true })}
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Trigger
            </label>
            <select
              {...register('trigger', { required: true })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select trigger</option>
              <option value="subscribe">On Subscribe</option>
              <option value="unsubscribe">On Unsubscribe</option>
              <option value="click">On Click</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Actions
            </label>
            <textarea
              {...register('actions', { required: true })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Define workflow actions"
            />
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

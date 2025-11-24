import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import { useForm } from 'react-hook-form'
import { templatesAPI } from '@/api/templates'

interface TemplateForm {
  name: string
  subject: string
  html: string
  text_content?: string
}

export default function Templates() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<TemplateForm>()

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesAPI.list().then((res) => res.data),
  })

  const onSubmit = async (data: TemplateForm) => {
    try {
      await templatesAPI.create(data)
      setCreateModalOpen(false)
      reset()
      refetch()
    } catch (error) {
      console.error('Create template failed:', error)
    }
  }

  const columns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'subject' as const, label: 'Subject' },
    { key: 'created_at' as const, label: 'Created' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Templates</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Template
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={templates || []}
            loading={isLoading}
          />
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        title="Create Template"
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
              Template Name
            </label>
            <input
              {...register('name', { required: true })}
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Subject
            </label>
            <input
              {...register('subject', { required: true })}
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              HTML Content
            </label>
            <textarea
              {...register('html', { required: true })}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

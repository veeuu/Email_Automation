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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await templatesAPI.delete(id)
        refetch()
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : templates && templates.length > 0 ? (
                templates.map((template) => (
                  <tr key={template.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{template.name}</td>
                    <td className="px-6 py-4 text-sm">{template.subject}</td>
                    <td className="px-6 py-4 text-sm">{template.created_at}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-600">No templates yet</td>
                </tr>
              )}
            </tbody>
          </table>
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

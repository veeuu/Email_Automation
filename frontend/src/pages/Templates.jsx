import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useForm } from 'react-hook-form'
import { templatesAPI } from '@/api/templates'

export default function Templates() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesAPI.list().then((res) => res.data),
  })

  const onSubmit = async (data) => {
    try {
      await templatesAPI.create(data)
      setCreateModalOpen(false)
      reset()
      refetch()
    } catch (error) {
      console.error('Create template failed:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this template?')) {
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage email templates</p>
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
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <div key={template.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-4 border border-green-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Subject: {template.subject}</p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">{new Date(template.created_at).toLocaleDateString()}</p>
                
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 text-center border-2 border-dashed border-green-200">
            <p className="text-2xl mb-2">📝</p>
            <p className="text-gray-600 text-sm">No templates yet</p>
            <p className="text-gray-500 text-xs mt-1">Create your first template to get started</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={createModalOpen}
        title="Create Template"
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
              placeholder="Template name"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
            <input
              {...register('subject', { required: true })}
              type="text"
              placeholder="Email subject"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">HTML Content</label>
            <textarea
              {...register('html', { required: true })}
              rows={8}
              placeholder="Paste your HTML email template here..."
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono text-xs"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 Tip: Use standard HTML/CSS. The tracking pixel will be automatically added.
            </p>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

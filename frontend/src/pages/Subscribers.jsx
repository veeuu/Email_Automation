import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { subscribersAPI } from '@/api/subscribers'

export default function Subscribers() {
  const [page, setPage] = useState(1)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['subscribers', page],
    queryFn: () => subscribersAPI.list(page, 50).then((res) => res.data),
  })

  const handleImport = async () => {
    if (!selectedFile) return
    try {
      await subscribersAPI.bulkImport(selectedFile)
      setImportModalOpen(false)
      setSelectedFile(null)
      refetch()
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this subscriber?')) {
      try {
        await subscribersAPI.delete(id)
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
            <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your email list</p>
          </div>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all font-medium text-sm"
          >
            + Import
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-sm overflow-hidden border border-blue-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-blue-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Created</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-2 text-xs font-medium text-gray-900">{subscriber.email}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">{subscriber.name || '-'}</td>
                        <td className="px-4 py-2 text-xs">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                            subscriber.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                            subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600">{new Date(subscriber.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-xs">
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            className="px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 text-xs">
                  Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-all font-medium text-xs"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 50 >= data.total}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-all font-medium text-xs"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 text-center border-2 border-dashed border-blue-200">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-gray-600 text-sm">No subscribers yet</p>
            <p className="text-gray-500 text-xs mt-1">Import a CSV file to add subscribers</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={importModalOpen}
        title="Import Subscribers"
        onClose={() => setImportModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setImportModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm disabled:opacity-50"
            >
              Import
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Upload CSV with email and name columns</p>
          <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input" className="cursor-pointer">
              <p className="text-xl mb-1">📁</p>
              <p className="text-gray-700 font-medium text-sm">{selectedFile ? selectedFile.name : 'Select CSV'}</p>
              <p className="text-gray-500 text-xs mt-0.5">or drag and drop</p>
            </label>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

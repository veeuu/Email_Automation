import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Table from '@/components/Table'
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
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Import CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{subscriber.email}</td>
                    <td className="px-6 py-4 text-sm">{subscriber.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{subscriber.created_at}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-600">No subscribers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 50 >= data.total}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
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
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Import
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">Upload a CSV file with email addresses</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>
      </Modal>
    </Layout>
  )
}

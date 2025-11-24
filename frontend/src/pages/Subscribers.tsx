import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import { subscribersAPI } from '@/api/subscribers'

export default function Subscribers() {
  const [page, setPage] = useState(1)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

  const columns = [
    { key: 'email' as const, label: 'Email' },
    { key: 'name' as const, label: 'Name' },
    { key: 'status' as const, label: 'Status' },
    { key: 'created_at' as const, label: 'Created' },
  ]

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

        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={data?.items || []}
            loading={isLoading}
          />
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

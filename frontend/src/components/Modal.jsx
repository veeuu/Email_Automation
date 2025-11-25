import React from 'react'

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="px-8 py-6">
          {children}
        </div>
        {footer && (
          <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

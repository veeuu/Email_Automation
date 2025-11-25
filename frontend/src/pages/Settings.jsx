import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import { useForm } from 'react-hook-form'
import client from '@/api/client'

interface SettingsForm {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  dkim_domain: string
  dkim_selector: string
}

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit } = useForm<SettingsForm>()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => client.get('/settings').then((res) => res.data),
  })

  const onSubmit = async (formData: SettingsForm) => {
    try {
      await client.post('/settings', formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Save settings failed:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        {saved && (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            Settings saved successfully
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">SMTP Configuration</h2>
          
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    SMTP Host
                  </label>
                  <input
                    {...register('smtp_host', { required: true })}
                    type="text"
                    defaultValue={settings?.smtp_host}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    SMTP Port
                  </label>
                  <input
                    {...register('smtp_port', { required: true })}
                    type="number"
                    defaultValue={settings?.smtp_port}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    SMTP User
                  </label>
                  <input
                    {...register('smtp_user')}
                    type="text"
                    defaultValue={settings?.smtp_user}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    SMTP Password
                  </label>
                  <input
                    {...register('smtp_password')}
                    type="password"
                    defaultValue={settings?.smtp_password}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <hr className="my-6" />

              <h2 className="text-xl font-semibold mb-4">DKIM Configuration</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    DKIM Domain
                  </label>
                  <input
                    {...register('dkim_domain', { required: true })}
                    type="text"
                    defaultValue={settings?.dkim_domain}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    DKIM Selector
                  </label>
                  <input
                    {...register('dkim_selector', { required: true })}
                    type="text"
                    defaultValue={settings?.dkim_selector}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}

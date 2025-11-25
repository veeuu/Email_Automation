import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

export default function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState('')
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)

  const onSubmit = async (data) => {
    try {
      setError('')
      const response = await authAPI.login(data)
      setToken(response.data.access_token)
      
      const userResponse = await authAPI.getMe()
      setUser(userResponse.data)
      
      navigate('/')
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed'
      setError(typeof errorMessage === 'string' ? errorMessage : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            EmailFlow
          </h1>
          <p className="text-gray-600">Your marketing, amplified</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Demo: demo@example.com / demo123456
          </p>
        </div>
      </div>
    </div>
  )
}

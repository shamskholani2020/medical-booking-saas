'use client'

import { useState, useEffect } from 'react'

export default function MessagesPage() {
  const [failedMessages, setFailedMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadFailedMessages()
  }, [])

  const loadFailedMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor/messages/retry')
      const data = await res.json()
      setFailedMessages(data.failed || [])
    } catch (error) {
      setMessage('Failed to load failed messages')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    setMessage('')
    try {
      const res = await fetch('/api/doctor/messages/retry', {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) throw new Error('Failed to retry')

      setMessage(`Successfully resent ${data.retryCount} messages!`)
      loadFailedMessages()
    } catch (error) {
      setMessage('Failed to retry messages')
    } finally {
      setRetrying(false)
    }
  }

  const formatTime = (timeSlot: string) => {
    const [hour, minute] = timeSlot.split(':')
    const date = new Date()
    date.setHours(parseInt(hour), parseInt(minute), 0, 0)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Message Status</h2>
          <p className="text-gray-600">View and manage confirmation messages</p>
        </div>
        {failedMessages.length > 0 && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {retrying ? 'Retrying...' : `Retry All (${failedMessages.length})`}
          </button>
        )}
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.includes('Failed')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Messages</h3>
        <ul className="space-y-1 text-blue-800 text-sm">
          <li>• Confirmation messages are sent automatically after booking</li>
          <li>• WhatsApp is used first, SMS as fallback</li>
          <li>• Failed messages can be retried here</li>
          <li>• Booking success doesn't depend on message delivery</li>
        </ul>
      </div>

      {/* Failed Messages List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Failed Messages ({failedMessages.length})
        </h3>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : failedMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-5xl mb-2">✅</div>
            <p>All messages sent successfully!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {failedMessages.map((msg) => (
              <div
                key={msg.id}
                className="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-900 font-medium">
                        {formatDate(msg.date)} at {formatTime(msg.timeSlot)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Failed
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{msg.patientName}</p>
                    <p className="text-gray-600 text-sm">{msg.patientPhone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

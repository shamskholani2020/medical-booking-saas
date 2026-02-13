'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddSlots, setShowAddSlots] = useState(false)
  const [message, setMessage] = useState('')

  // Initialize with today's date
  useEffect(() => {
    const today = new Date()
    const formatted = today.toISOString().split('T')[0]
    setSelectedDate(formatted)
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    loadSlots()
  }, [selectedDate])

  const loadSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/doctor/availability?date=${selectedDate}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch (error) {
      setMessage('Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (slotId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/doctor/availability/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      })

      if (!res.ok) throw new Error('Failed to update slot')

      loadSlots()
      setMessage('Slot updated successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update slot')
    }
  }

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm('Are you sure you want to delete this slot?')) return

    try {
      const res = await fetch(`/api/doctor/availability/${slotId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete slot')

      loadSlots()
      setMessage('Slot deleted successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to delete slot')
    }
  }

  const handleAddSlots = async (data: any) => {
    try {
      const res = await fetch('/api/doctor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to add slots')

      loadSlots()
      setShowAddSlots(false)
      setMessage('Slots added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to add slots')
    }
  }

  const getNextDays = () => {
    const days = []
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Availability</h2>
        <p className="text-gray-600">Add, block, or remove your time slots</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      {/* Date Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {getNextDays().map((date) => {
            const dateStr = date.toISOString().split('T')[0]
            const isSelected = selectedDate === dateStr
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="text-sm">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-semibold">{date.getDate()}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Time Slots for {selectedDate}
          </h3>
          <button
            onClick={() => setShowAddSlots(!showAddSlots)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showAddSlots ? 'Cancel' : 'Add Slots'}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No slots for this date. Click "Add Slots" to create some.
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  slot.isBlocked ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-gray-900">
                    {formatTime(slot.timeSlot)}
                  </span>
                  {slot.isBooked && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Booked
                    </span>
                  )}
                  {slot.isBlocked && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!slot.isBooked && (
                    <>
                      <button
                        onClick={() => handleToggleBlock(slot.id, slot.isBlocked)}
                        className={`px-3 py-1 rounded text-sm ${
                          slot.isBlocked
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {slot.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Slots Modal */}
      {showAddSlots && <AddSlotsModal date={selectedDate} onAdd={handleAddSlots} onCancel={() => setShowAddSlots(false)} />}
    </div>
  )
}

function AddSlotsModal({ date, onAdd, onCancel }: any) {
  const [startHour, setStartHour] = useState('09')
  const [endHour, setEndHour] = useState('17')

  const hours = Array.from({ length: 14 }, (_, i) => (8 + i).toString().padStart(2, '0'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      date,
      startHour: parseInt(startHour),
      endHour: parseInt(endHour),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Time Slots</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Hour
            </label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {hours.map((h) => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Hour
            </label>
            <select
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {hours.map((h) => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Add Slots
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

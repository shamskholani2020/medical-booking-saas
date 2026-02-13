'use client'

import { useState, useEffect } from 'react'
import { Doctor } from '@/prisma/client'

import { formatDate, formatTime } from '@/lib/utils'

interface DoctorBookingPageProps {
  doctor: Doctor
}

export default function DoctorBookingPage({ doctor }: DoctorBookingPageProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
  })

  // Initialize with today's date
  useEffect(() => {
    const today = new Date()
    const formatted = today.toISOString().split('T')[0]
    setSelectedDate(formatted)
  }, [])

  // Load available slots when date changes
  useEffect(() => {
    if (!selectedDate) return

    const loadSlots = async () => {
      setLoading(true)
      setError('')
      setSelectedSlot(null)

      try {
        const res = await fetch(
          `/api/availability?doctorId=${doctor.id}&date=${selectedDate}`
        )

        if (!res.ok) {
          throw new Error('Failed to load availability')
        }

        const data = await res.json()
        setAvailableSlots(data.availableSlots || [])
      } catch (err) {
        setError('Failed to load available slots')
        setAvailableSlots([])
      } finally {
        setLoading(false)
      }
    }

    loadSlots()
  }, [selectedDate, doctor.id])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    if (!formData.patientName.trim() || !formData.patientPhone.trim()) {
      setError('Please fill in all fields')
      return
    }

    setBooking(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          patientName: formData.patientName,
          patientPhone: formData.patientPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment')
      setSuccess(false)
    } finally {
      setBooking(false)
    }
  }

  // Get next 7 days
  const getNextDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Appointment Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Your appointment with {doctor.name} has been booked.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-900 font-medium">
                {formatDate(new Date(selectedDate))}
              </p>
              <p className="text-gray-600">
                {availableSlots.find((s) => s.timeSlot === selectedSlot)?.formattedTime}
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You'll receive a confirmation via WhatsApp/SMS shortly.
            </p>
            <button
              onClick={() => {
                setSuccess(false)
                setSelectedSlot(null)
                setFormData({ patientName: '', patientPhone: '' })
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a
            href="/"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Doctor Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {doctor.name}
          </h1>
          {doctor.phone && (
            <p className="text-gray-600 flex items-center gap-2">
              <span>📞</span>
              <span>{doctor.phone}</span>
            </p>
          )}
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Date
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getNextDays().map((date) => {
              const dateStr = date.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr
              const isWeekend = date.getDay() === 0 || date.getDay() === 6

              return (
                <button
                  key={dateStr}
                  onClick={() => !isWeekend && setSelectedDate(dateStr)}
                  disabled={isWeekend}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isWeekend
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div className="text-sm">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-semibold">
                    {date.getDate()}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Time Slots
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-gray-600">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.timeSlot)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    selectedSlot === slot.timeSlot
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-blue-500'
                  }`}
                >
                  {slot.formattedTime}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form */}
        {selectedSlot && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Information
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="patientPhone"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, patientPhone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="09xxxxxxxx"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: 09xxxxxxxx or +9639xxxxxxxx
                </p>
              </div>
              <button
                type="submit"
                disabled={booking}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {booking ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

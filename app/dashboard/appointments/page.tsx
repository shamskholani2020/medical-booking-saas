'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const today = new Date()
    const formatted = today.toISOString().split('T')[0]
    setSelectedDate(formatted)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadAppointments()
    }
  }, [selectedDate, filterStatus])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/doctor/appointments?date=${selectedDate}`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (appointmentId: number, status: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update appointment')

      loadAppointments()
    } catch (error) {
      alert('Failed to update appointment')
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const filteredAppointments = appointments.filter((apt) =>
    filterStatus === 'all' ? true : apt.status === filterStatus
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <p className="text-gray-600">View and manage your patient appointments</p>
      </div>

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

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Appointments ({filteredAppointments.length})
        </h3>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatTime(appointment.timeSlot)}
                      </span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      {appointment.patientName}
                    </p>
                    <p className="text-gray-600 mb-2">{appointment.patientPhone}</p>
                    {appointment.createdAt && (
                      <p className="text-gray-500 text-sm">
                        Booked: {new Date(appointment.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this appointment?')) {
                            handleUpdateStatus(appointment.id, 'cancelled')
                          }
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
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

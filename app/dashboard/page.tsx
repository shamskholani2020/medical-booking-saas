import { prisma } from '@/lib/prisma'
import { requireDoctorAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const doctorId = await requireDoctorAuth()

  // Get today's appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: today,
    },
    orderBy: { timeSlot: 'asc' },
    include: {
      doctor: {
        select: {
          name: true,
        },
      },
    },
  })

  // Get this week's stats
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: {
      status: true,
    },
  })

  const stats = {
    total: weekAppointments.length,
    completed: weekAppointments.filter((a) => a.status === 'completed').length,
    pending: weekAppointments.filter((a) => a.status === 'pending').length,
    cancelled: weekAppointments.filter((a) => a.status === 'cancelled').length,
  }

  const todayStats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter((a) => a.status === 'completed').length,
    pending: todayAppointments.filter((a) => a.status === 'pending').length,
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600">Here's your clinic overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm">This Week</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-gray-500 text-xs">Total appointments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-gray-500 text-xs">This week</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm">Today</p>
          <p className="text-2xl font-bold text-blue-600">{todayStats.total}</p>
          <p className="text-gray-500 text-xs">Total appointments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{todayStats.pending}</p>
          <p className="text-gray-500 text-xs">Today</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Appointments
          </h3>
          <Link
            href="/dashboard/appointments"
            className="text-blue-600 hover:underline text-sm"
          >
            View All →
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments scheduled for today
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 font-medium">
                      {formatTime(appointment.timeSlot)}
                    </span>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <p className="text-gray-700">{appointment.patientName}</p>
                  <p className="text-gray-500 text-sm">{appointment.patientPhone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/availability"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-2">📅 Manage Availability</h3>
          <p className="text-gray-600 text-sm">
            Add or block time slots for patient bookings
          </p>
        </Link>
        <Link
          href="/dashboard/qr"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-2">📱 Get Your QR Code</h3>
          <p className="text-gray-600 text-sm">
            Print and share your booking QR code with patients
          </p>
        </Link>
      </div>
    </div>
  )
}

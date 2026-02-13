'use client'

import { useRouter } from 'next/navigation'

export default function DashboardNav() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav className="flex items-center gap-2">
      <a
        href="/dashboard"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        Overview
      </a>
      <span className="text-gray-300">|</span>
      <a
        href="/dashboard/availability"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        Availability
      </a>
      <span className="text-gray-300">|</span>
      <a
        href="/dashboard/appointments"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        Appointments
      </a>
      <span className="text-gray-300">|</span>
      <a
        href="/dashboard/messages"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        Messages
      </a>
      <span className="text-gray-300">|</span>
      <a
        href="/dashboard/qr"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        QR Code
      </a>
      <button
        onClick={handleLogout}
        className="ml-4 bg-red-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-700"
      >
        Logout
      </button>
    </nav>
  )
}

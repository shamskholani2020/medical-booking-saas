import { redirect } from 'next/navigation'
import { requireDoctorAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardNav from './dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let doctorId: number
  try {
    doctorId = await requireDoctorAuth()
  } catch {
    redirect('/login')
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!doctor) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">📋 Doctor Dashboard</h1>
              <p className="text-gray-600 text-sm">{doctor.name}</p>
            </div>
            <DashboardNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

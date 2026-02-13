import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🏥 Medical Booking</h1>
          <p className="text-gray-600 text-sm">Simple appointment booking for Syria</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Book Your Doctor Appointment Online</h2>
          <p className="text-blue-100">
            No registration required. Quick, simple, and free.
          </p>
        </div>

        {/* Doctors List */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Doctors</h2>

        {doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <p className="text-gray-500">No doctors available yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later or contact us to join.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/d/${doctor.slug}`}
                className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {doctor.name}
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      {doctor.phone && (
                        <p className="flex items-center gap-2 text-sm">
                          <span>📞</span>
                          <span>{doctor.phone}</span>
                        </p>
                      )}
                      {doctor.whatsappNumber && (
                        <p className="flex items-center gap-2 text-sm">
                          <span>💬</span>
                          <span>WhatsApp available</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                      Book Now →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-3">1️⃣</div>
            <h3 className="font-semibold text-gray-900 mb-2">Choose a Doctor</h3>
            <p className="text-gray-600 text-sm">Browse available doctors and select one.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-3">2️⃣</div>
            <h3 className="font-semibold text-gray-900 mb-2">Pick a Time</h3>
            <p className="text-gray-600 text-sm">Select your preferred date and time slot.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-3">3️⃣</div>
            <h3 className="font-semibold text-gray-900 mb-2">Confirm</h3>
            <p className="text-gray-600 text-sm">Enter your details and get instant confirmation.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 text-sm">Simple appointment booking for Syria</p>
          <p className="text-gray-400 text-xs mt-2">© 2026 Medical Booking</p>
        </div>
      </footer>
    </div>
  )
}

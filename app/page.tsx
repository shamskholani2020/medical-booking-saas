import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function HomePage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🏥 Medical Booking</h1>
          <p className="text-gray-600">Book appointments with doctors in Syria</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Doctors</h2>

        {doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No doctors available yet.</p>
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
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {doctor.name}
                    </h3>
                    {doctor.phone && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <span>📞</span>
                        <span>{doctor.phone}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-blue-600 font-medium">Book Now →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>Simple appointment booking for Syria</p>
        </div>
      </footer>
    </div>
  )
}

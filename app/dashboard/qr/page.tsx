import { prisma } from '@/lib/prisma'
import { requireDoctorAuth } from '@/lib/auth'
import QRCode from 'qrcode'
import { baseUrl } from '@/lib/utils'

export default async function QRPage() {
  const doctorId = await requireDoctorAuth()

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!doctor) {
    return <div>Doctor not found</div>
  }

  // Generate QR code for doctor's public page
  const bookingUrl = `${baseUrl}/d/${doctor.slug}`
  const qrCodeDataUrl = await QRCode.toDataURL(bookingUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your QR Code</h2>
        <p className="text-gray-600">Share this QR code with patients</p>
      </div>

      {/* QR Code Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <img
              src={qrCodeDataUrl}
              alt="Booking QR Code"
              className="w-64 h-64"
            />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {doctor.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Scan to book appointments
            </p>
            <div className="bg-gray-50 rounded-lg p-3 max-w-sm">
              <p className="text-sm text-gray-600 break-all">
                {bookingUrl}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Print QR Code
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How to Use This QR Code
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span>1️⃣</span>
            <span>Print this QR code and display it in your clinic</span>
          </li>
          <li className="flex items-start gap-2">
            <span>2️⃣</span>
            <span>Patients can scan it with their phone camera</span>
          </li>
          <li className="flex items-start gap-2">
            <span>3️⃣</span>
            <span>They'll be taken to your booking page instantly</span>
          </li>
          <li className="flex items-start gap-2">
            <span>4️⃣</span>
            <span>No need to remember or share long URLs</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import DoctorBookingPage from './doctor-booking-page'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const doctor = await prisma.doctor.findUnique({
    where: { slug },
  })

  if (!doctor) {
    return {
      title: 'Doctor Not Found',
    }
  }

  return {
    title: `Book Appointment - ${doctor.name}`,
    description: `Book an appointment with ${doctor.name}`,
  }
}

export default async function DoctorPage({ params }: PageProps) {
  const { slug } = await params
  const doctor = await prisma.doctor.findUnique({
    where: { slug },
  })

  if (!doctor) {
    notFound()
  }

  return <DoctorBookingPage doctor={doctor} />
}

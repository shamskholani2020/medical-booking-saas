import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctorId')
  const dateStr = searchParams.get('date')

  if (!doctorId || !dateStr) {
    return NextResponse.json(
      { error: 'Missing doctorId or date' },
      { status: 400 }
    )
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  // Get all availability for this doctor on this date
  const availability = await prisma.availability.findMany({
    where: {
      doctorId: parseInt(doctorId),
      date,
    },
    orderBy: { timeSlot: 'asc' },
  })

  // Get booked appointments to filter out taken slots
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: parseInt(doctorId),
      date,
      status: { not: 'cancelled' },
    },
    select: {
      timeSlot: true,
    },
  })

  const bookedSlots = new Set(appointments.map((appt) => appt.timeSlot))

  // Return available slots (not blocked and not booked)
  const availableSlots = availability
    .filter((slot) => !slot.isBlocked && !bookedSlots.has(slot.timeSlot))
    .map((slot) => ({
      id: slot.id,
      timeSlot: slot.timeSlot,
      formattedTime: formatTime(slot.timeSlot),
    }))

  return NextResponse.json({
    date: dateStr,
    availableSlots,
    totalSlots: availability.length,
    bookedSlots: appointments.length,
  })
}

function formatTime(timeSlot: string): string {
  const [hour, minute] = timeSlot.split(':')
  const date = new Date()
  date.setHours(parseInt(hour), parseInt(minute), 0, 0)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

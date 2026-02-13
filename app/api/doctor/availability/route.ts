import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDoctorAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const doctorId = await requireDoctorAuth()
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 })
    }

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    // Get all availability for this date
    const availability = await prisma.availability.findMany({
      where: { doctorId, date },
      orderBy: { timeSlot: 'asc' },
    })

    // Get booked appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: { not: 'cancelled' },
      },
      select: { timeSlot: true },
    })

    const bookedSlots = new Set(appointments.map((a) => a.timeSlot))

    const slots = availability.map((slot) => ({
      ...slot,
      isBooked: bookedSlots.has(slot.timeSlot),
    }))

    return NextResponse.json({ slots })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Availability fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const doctorId = await requireDoctorAuth()
    const body = await request.json()
    const { date, startHour, endHour } = body

    if (!date || startHour === undefined || endHour === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    // Generate time slots (30-minute intervals)
    const slots = []
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    // Create slots (upsert to avoid duplicates)
    const created = []
    for (const timeSlot of slots) {
      const slot = await prisma.availability.upsert({
        where: {
          doctorId_date_timeSlot: {
            doctorId,
            date: bookingDate,
            timeSlot,
          },
        },
        update: { isBlocked: false },
        create: {
          doctorId,
          date: bookingDate,
          timeSlot,
          isBlocked: false,
        },
      })
      created.push(slot)
    }

    return NextResponse.json({
      success: true,
      count: created.length,
      slots: created,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Availability create error:', error)
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 })
  }
}

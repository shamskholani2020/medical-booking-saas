import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { doctorId, date, timeSlot, patientName, patientPhone } = body

    // Validate input
    if (!doctorId || !date || !timeSlot || !patientName || !patientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate phone format (basic Syria phone validation)
    const phoneRegex = /^(\+?963|0)?9\d{8}$/
    if (!phoneRegex.test(patientPhone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Check if availability exists and is not blocked
    const availability = await prisma.availability.findUnique({
      where: {
        doctorId_date_timeSlot: {
          doctorId,
          date: bookingDate,
          timeSlot,
        },
      },
    })

    if (!availability) {
      return NextResponse.json(
        { error: 'This time slot is not available' },
        { status: 400 }
      )
    }

    if (availability.isBlocked) {
      return NextResponse.json(
        { error: 'This time slot is currently blocked' },
        { status: 400 }
      )
    }

    // Create appointment - unique constraint will prevent double booking
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName: patientName.trim(),
        patientPhone: patientPhone.replace(/\s/g, ''),
        date: bookingDate,
        timeSlot,
        status: 'confirmed',
        messageStatus: 'pending', // Will be sent asynchronously
      },
    })

    // Send confirmation message asynchronously (non-blocking)
    // This doesn't affect the booking success
    sendConfirmationAsync(appointment.id)

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: appointment.id,
          doctorName: doctor.name,
          patientName: appointment.patientName,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          status: appointment.status,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    // Handle unique constraint violation (double booking)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This time slot has just been booked. Please choose another.' },
        { status: 409 }
      )
    }

    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// Async function to send confirmation (non-blocking)
async function sendConfirmationAsync(appointmentId: number) {
  try {
    // Import dynamically to avoid circular dependencies
    const { sendBookingConfirmation } = await import('@/lib/messaging')
    await sendBookingConfirmation(appointmentId)
  } catch (error) {
    console.error('Error sending confirmation asynchronously:', error)
  }
}

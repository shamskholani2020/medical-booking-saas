import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDoctorAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const doctorId = await requireDoctorAuth()
    const { id } = await context.params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Check if appointment exists and belongs to doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.doctorId !== doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update appointment status
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
    })

    // Send cancellation notification if status changed to cancelled
    if (status === 'cancelled') {
      sendCancellationAsync(appointment.id)
    }

    return NextResponse.json({ success: true, appointment: updated })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Appointment update error:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

// Async function to send cancellation notification (non-blocking)
async function sendCancellationAsync(appointmentId: number) {
  try {
    const { sendCancellationNotification } = await import('@/lib/messaging')
    await sendCancellationNotification(appointmentId)
  } catch (error) {
    console.error('Error sending cancellation notification asynchronously:', error)
  }
}

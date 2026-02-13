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
    const { isBlocked } = body

    // Check if slot exists and belongs to doctor
    const slot = await prisma.availability.findUnique({
      where: { id: parseInt(id) },
    })

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (slot.doctorId !== doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update slot
    const updated = await prisma.availability.update({
      where: { id: parseInt(id) },
      data: { isBlocked },
    })

    return NextResponse.json({ success: true, slot: updated })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Availability update error:', error)
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const doctorId = await requireDoctorAuth()
    const { id } = await context.params

    // Check if slot exists and belongs to doctor
    const slot = await prisma.availability.findUnique({
      where: { id: parseInt(id) },
    })

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (slot.doctorId !== doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if slot is booked
    const appointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: slot.date,
        timeSlot: slot.timeSlot,
        status: { not: 'cancelled' },
      },
    })

    if (appointment) {
      return NextResponse.json(
        { error: 'Cannot delete booked slot. Cancel appointment first.' },
        { status: 400 }
      )
    }

    // Delete slot
    await prisma.availability.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Availability delete error:', error)
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}

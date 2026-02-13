import { NextResponse } from 'next/server'
import { requireDoctorAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retryFailedMessages } from '@/lib/messaging'

export const dynamic = 'force-dynamic'

// Manual retry endpoint (doctor can trigger)
export async function POST(request: Request) {
  try {
    const doctorId = await requireDoctorAuth()

    // Retry failed messages for this doctor's appointments
    const failedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        messageStatus: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 50,
    })

    let retryCount = 0
    const { sendBookingConfirmation } = await import('@/lib/messaging')

    for (const appointment of failedAppointments) {
      try {
        await sendBookingConfirmation(appointment.id)
        retryCount++
      } catch (error) {
        console.error(`Retry failed for appointment ${appointment.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      retryCount,
      totalFailed: failedAppointments.length,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry messages' },
      { status: 500 }
    )
  }
}

// Get failed messages status
export async function GET(request: Request) {
  try {
    const doctorId = await requireDoctorAuth()

    const failedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        messageStatus: 'failed',
      },
      include: {
        doctor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({
      failed: failedAppointments,
      count: failedAppointments.length,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get failed messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch failed messages' },
      { status: 500 }
    )
  }
}

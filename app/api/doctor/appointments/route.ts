import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDoctorAuth } from '@/lib/auth'

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

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
      },
      orderBy: { timeSlot: 'asc' },
    })

    return NextResponse.json({ appointments })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Appointments fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

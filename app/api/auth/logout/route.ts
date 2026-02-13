import { NextResponse } from 'next/server'
import { clearDoctorSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await clearDoctorSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

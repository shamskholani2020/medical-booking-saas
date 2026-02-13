import { NextResponse } from 'next/server'
import { verifyDoctorLogin, setDoctorSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { doctorId, password } = body

    if (!doctorId || !password) {
      return NextResponse.json(
        { error: 'Doctor ID and password are required' },
        { status: 400 }
      )
    }

    // For MVP: Simple auth using phone number as password
    // In production: Store and verify hashed password
    const result = await verifyDoctorLogin(parseInt(doctorId), password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Set session
    await setDoctorSession(result.doctor.id)

    return NextResponse.json({
      success: true,
      doctor: {
        id: result.doctor.id,
        name: result.doctor.name,
        slug: result.doctor.slug,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}


import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function verifyDoctorLogin(
  doctorId: number,
  password: string
): Promise<{ success: boolean; doctor?: any; error?: string }> {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    })

    if (!doctor) {
      return { success: false, error: 'Doctor not found' }
    }

    // For MVP: Use last 4 digits of phone number as password
    // Example: Phone +963912345678 → Password: 5678
    const expectedPassword = doctor.phone?.slice(-4)

    if (!expectedPassword || password !== expectedPassword) {
      return { success: false, error: 'Invalid password' }
    }

    return { success: true, doctor }
  } catch (error) {
    return { success: false, error: 'Login failed' }
  }
}

export async function setDoctorSession(doctorId: number) {
  const cookieStore = await cookies()
  cookieStore.set('doctor_session', doctorId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function getDoctorSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('doctor_session')
  return session?.value
}

export async function clearDoctorSession() {
  const cookieStore = await cookies()
  cookieStore.delete('doctor_session')
}

export async function requireDoctorAuth() {
  const session = await getDoctorSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return parseInt(session)
}

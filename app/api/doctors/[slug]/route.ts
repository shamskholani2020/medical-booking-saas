import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const doctor = await prisma.doctor.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsappNumber: true,
    },
  })

  if (!doctor) {
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
  }

  return NextResponse.json({ doctor })
}

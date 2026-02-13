import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a sample doctor
  const doctor = await prisma.doctor.upsert({
    where: { slug: 'dr-ahmad-ali' },
    update: {},
    create: {
      name: 'Dr. Ahmad Ali',
      slug: 'dr-ahmad-ali',
      phone: '+963912345678',
      whatsappNumber: '+963912345678',
    },
  })

  // Create some availability for the next 7 days (working hours: 9 AM - 5 PM)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const timeSlots = []
  for (let hour = 9; hour < 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() !== 6 && date.getDay() !== 0) {
      for (const timeSlot of timeSlots) {
        await prisma.availability.upsert({
          where: {
            doctorId_date_timeSlot: {
              doctorId: doctor.id,
              date,
              timeSlot,
            },
          },
          update: {},
          create: {
            doctorId: doctor.id,
            date,
            timeSlot,
            isBlocked: false,
          },
        })
      }
    }
  }

  console.log('✅ Seed completed!')
  console.log(`Doctor: ${doctor.name}`)
  console.log(`Public page: /d/${doctor.slug}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

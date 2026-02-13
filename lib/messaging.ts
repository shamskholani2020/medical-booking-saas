import { prisma } from './prisma'
import { getMessageService, formatPhoneNumber } from './message-service'

// Send booking confirmation message (async, non-blocking)
export async function sendBookingConfirmation(appointmentId: number): Promise<void> {
  try {
    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    })

    if (!appointment) {
      console.error(`Appointment ${appointmentId} not found`)
      return
    }

    // Update message status to sending
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { messageStatus: 'pending' },
    })

    const messageService = getMessageService()
    const patientPhone = formatPhoneNumber(appointment.patientPhone)
    const doctorPhone = appointment.doctor.whatsappNumber
      ? formatPhoneNumber(appointment.doctor.whatsappNumber)
      : null

    // Format date and time
    const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const [hour, minute] = appointment.timeSlot.split(':')
    const timeDate = new Date()
    timeDate.setHours(parseInt(hour), parseInt(minute), 0, 0)
    const timeStr = timeDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    // Create message
    const message = `✅ Appointment Confirmed!\n\n` +
      `Doctor: ${appointment.doctor.name}\n` +
      `Date: ${dateStr}\n` +
      `Time: ${timeStr}\n` +
      `Patient: ${appointment.patientName}\n\n` +
      `Thank you for booking with us! 🏥`

    // Try WhatsApp first, fallback to SMS
    try {
      if (doctorPhone) {
        // Send from doctor's WhatsApp number if available
        // Note: This requires Twilio WhatsApp Business API with approved sender
        await messageService.sendWhatsApp(patientPhone, message)
      } else {
        await messageService.sendSMS(patientPhone, message)
      }

      // Update message status to sent
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { messageStatus: 'sent' },
      })

      console.log(`Confirmation sent for appointment ${appointmentId}`)
    } catch (error) {
      console.error(`Failed to send confirmation for appointment ${appointmentId}:`, error)

      // Update message status to failed
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { messageStatus: 'failed' },
      })

      // TODO: Implement retry strategy here
      // Could use a cron job to retry failed messages
    }
  } catch (error) {
    console.error(`Error in sendBookingConfirmation for ${appointmentId}:`, error)
  }
}

// Send appointment cancellation message
export async function sendCancellationNotification(appointmentId: number): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    })

    if (!appointment) return

    const messageService = getMessageService()
    const patientPhone = formatPhoneNumber(appointment.patientPhone)

    const message = `❌ Appointment Cancelled\n\n` +
      `Your appointment with ${appointment.doctor.name} has been cancelled.\n\n` +
      `Please book a new appointment if needed. 🏥`

    try {
      await messageService.sendSMS(patientPhone, message)
    } catch (error) {
      console.error('Failed to send cancellation notification:', error)
    }
  } catch (error) {
    console.error('Error in sendCancellationNotification:', error)
  }
}

// Retry failed messages (called by cron job)
export async function retryFailedMessages(): Promise<number> {
  try {
    // Get all failed messages from last 24 hours
    const failedAppointments = await prisma.appointment.findMany({
      where: {
        messageStatus: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 50, // Limit to 50 per run
    })

    let retryCount = 0
    for (const appointment of failedAppointments) {
      try {
        await sendBookingConfirmation(appointment.id)
        retryCount++
      } catch (error) {
        console.error(`Retry failed for appointment ${appointment.id}:`, error)
      }
    }

    return retryCount
  } catch (error) {
    console.error('Error in retryFailedMessages:', error)
    return 0
  }
}

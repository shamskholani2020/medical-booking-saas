// Simple console-based message service for MVP
// In production, integrate with your preferred messaging provider

export interface MessageService {
  sendWhatsApp(to: string, message: string): Promise<void>
  sendSMS(to: string, message: string): Promise<void>
}

export class ConsoleMessageService implements MessageService {
  async sendWhatsApp(to: string, message: string): Promise<void> {
    console.log(`[WhatsApp] To: ${to}`)
    console.log(`[WhatsApp] Message: ${message}`)
    console.log(`[WhatsApp] Note: Integrate messaging provider in production`)
  }

  async sendSMS(to: string, message: string): Promise<void> {
    console.log(`[SMS] To: ${to}`)
    console.log(`[SMS] Message: ${message}`)
    console.log(`[SMS] Note: Integrate messaging provider in production`)
  }
}

// Factory function to get the message service
export function getMessageService(): MessageService {
  // Currently using console service - integrate your provider here
  // Example providers to integrate:
  // - Twilio (WhatsApp + SMS)
  // - MessageBird
  // - WhatsApp Business API directly
  // - Local SMS gateway
  return new ConsoleMessageService()
}

// Format phone number for Syria
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '')

  // Add +963 if missing (Syria country code)
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = '963' + cleaned.slice(1)
    } else if (!cleaned.startsWith('963')) {
      cleaned = '963' + cleaned
    }
    cleaned = '+' + cleaned
  }

  return cleaned
}

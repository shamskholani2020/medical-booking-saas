// Message service interface - supports WhatsApp and SMS
// Uses Twilio as default provider (can be extended)

export interface MessageService {
  sendWhatsApp(to: string, message: string): Promise<void>
  sendSMS(to: string, message: string): Promise<void>
}

export class TwilioMessageService implements MessageService {
  private accountSid: string
  private authToken: string
  private whatsappFrom: string
  private smsFrom: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || ''
    this.smsFrom = process.env.TWILIO_SMS_FROM || ''
  }

  async sendWhatsApp(to: string, message: string): Promise<void> {
    if (!this.accountSid || !this.authToken || !this.whatsappFrom) {
      throw new Error('Twilio WhatsApp not configured')
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${this.whatsappFrom}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to send WhatsApp: ${response.statusText}`)
    }
  }

  async sendSMS(to: string, message: string): Promise<void> {
    if (!this.accountSid || !this.authToken || !this.smsFrom) {
      throw new Error('Twilio SMS not configured')
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: this.smsFrom,
          To: to,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.statusText}`)
    }
  }
}

// Fallback service that just logs (for development)
export class ConsoleMessageService implements MessageService {
  async sendWhatsApp(to: string, message: string): Promise<void> {
    console.log(`[WhatsApp Mock] To: ${to}, Message: ${message}`)
  }

  async sendSMS(to: string, message: string): Promise<void> {
    console.log(`[SMS Mock] To: ${to}, Message: ${message}`)
  }
}

// Factory function to get the appropriate service
export function getMessageService(): MessageService {
  // Use Twilio if configured, otherwise use console for development
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return new TwilioMessageService()
  }
  return new ConsoleMessageService()
}

// Format phone number for Twilio
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

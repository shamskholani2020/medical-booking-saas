export interface TimeSlot {
  date: Date
  timeSlot: string
  isAvailable: boolean
  isBooked?: boolean
  isBlocked?: boolean
}

export interface DoctorWithAvailability {
  id: number
  name: string
  slug: string
  phone: string | null
  whatsappNumber: string | null
  availabilities?: Array<{
    date: Date
    timeSlot: string
    isBlocked: boolean
  }>
}

export interface BookingFormData {
  patientName: string
  patientPhone: string
}

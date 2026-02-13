# Medical Booking SaaS - Project Structure

## Directory Structure

```
medical-booking-saas/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── doctors/          # Doctor endpoints
│   │   ├── availability/     # Availability endpoints
│   │   └── bookings/         # Booking endpoints
│   ├── d/                    # Doctor public pages
│   │   └── [slug]/           # Dynamic doctor page
│   ├── dashboard/            # Doctor dashboard
│   └── layout.tsx            # Root layout
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma client singleton
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Helper functions
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── components/               # React components
│   ├── ui/                   # UI components (buttons, inputs, etc.)
│   ├── booking/              # Booking flow components
│   └── dashboard/            # Dashboard components
├── public/                   # Static assets
└── .env                      # Environment variables
```

## Database Schema

### Models
- **Doctor**: Stores doctor information with unique slug
- **Availability**: Time slots that can be booked
- **Appointment**: Booked appointments with status tracking

### Key Constraints
- `@@unique([doctorId, date, timeSlot])` on both Availability and Appointment
  - Prevents duplicate time slots
  - Prevents double bookings
- Indexed columns for performance: doctorId, date

## API Routes (To Implement)

### `/api/doctors`
- `GET` - List all doctors (public)
- `POST` - Create doctor (protected)

### `/api/doctors/[slug]`
- `GET` - Get doctor by slug (public)

### `/api/availability`
- `GET` - Get available slots for a doctor + date (public)
- `POST` - Add availability (protected, doctor only)
- `PATCH` - Update/block slots (protected, doctor only)
- `DELETE` - Remove availability (protected, doctor only)

### `/api/bookings`
- `POST` - Create appointment (public, no auth required)

### `/api/bookings/[id]`
- `PATCH` - Update appointment status (protected, doctor only)

## Pages

### Public Pages
- `/` - Landing page (list of doctors)
- `/d/[slug]` - Doctor's public booking page

### Protected Pages (Doctor Dashboard)
- `/dashboard` - Doctor overview
- `/dashboard/availability` - Manage availability
- `/dashboard/appointments` - View/manage appointments
- `/dashboard/qr` - QR code for sharing

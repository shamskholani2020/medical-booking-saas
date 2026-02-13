# Medical Booking SaaS - MVP

Simple doctor appointment booking system for Syria.

## Stack
- Next.js 16 (App Router)
- PostgreSQL
- Prisma ORM
- TailwindCSS
- TypeScript

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed sample data**
   ```bash
   npm run db:seed
   ```
   This creates a sample doctor:
   - Name: Dr. Ahmad Ali
   - Doctor ID: 1
   - Phone: +963912345678
   - **Password (MVP):** 5678 (last 4 digits of phone)

5. **Start development server**
   ```bash
   npm run dev
   ```

## Doctor Login (MVP)

For MVP, use your **Doctor ID** and **last 4 digits of phone number** as password.

Example for seeded doctor:
- Doctor ID: `1`
- Password: `5678`

## Database Models

- **Doctor**: Basic doctor info + unique slug for public pages
- **Availability**: Time slots created by doctors (can be blocked)
- **Appointment**: Patient bookings with status tracking

## Core Features

- ✅ Mobile-first UI
- ✅ Doctor public pages (`/d/[slug]`)
- ✅ Simple patient booking (name + phone, no auth)
- ✅ Doctor dashboard (availability management, appointment view)
- ✅ Double-booking prevention at DB level
- ✅ WhatsApp/SMS confirmation (async, non-blocking)

## MVP Constraints

- No user registration for patients
- 30-minute fixed time slots
- Extremely simple dashboard for non-technical doctors
- Booking succeeds regardless of message delivery

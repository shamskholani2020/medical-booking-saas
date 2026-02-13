# Deployment Guide

## Using Docker Compose (Recommended for Production)

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available

### Quick Start

1. **Clone and navigate to project**
   ```bash
   cd medical-booking-saas
   ```

2. **Build and start containers**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Seed database (optional)**
   ```bash
   docker-compose exec app npm run db:seed
   ```

5. **Access the app**
   - Visit: `http://localhost:3000`
   - PostgreSQL: `localhost:5432`
   - DB User: `postgres`
   - DB Password: `postgres`

### Management Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Run shell in app container
docker-compose exec app sh
```

---

## Using Docker Build (Custom Deployment)

### Build Image
```bash
docker build -t medical-booking-saas .
```

### Run Container
```bash
docker run -d \
  --name medical-booking-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/db?schema=public" \
  medical-booking-saas
```

---

## Vercel Deployment (Alternative)

### Prerequisites
- PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
- Vercel account

### Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import repository
   - Configure environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
   - Deploy

3. **Run migrations**
   - After deployment, open Vercel project
   - Go to Settings → Environment Variables
   - Add `POSTGRES_URL` (same as DATABASE_URL)
   - Run in Vercel CLI or terminal:
     ```bash
     vercel env pull .env.local
     npx prisma migrate deploy
     ```

4. **Seed database (optional)**
   ```bash
   npm run db:seed
   ```

---

## Environment Variables

Create `.env` file:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/medical_booking?schema=public"

# WhatsApp/SMS (Optional - for Phase 4)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM=""

# Next.js (Optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Production Checklist

- [ ] Set strong database password
- [ ] Configure WhatsApp/SMS API
- [ ] Set up HTTPS (SSL certificate)
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Review doctor authentication security
- [ ] Test full booking flow
- [ ] Verify mobile responsiveness

---

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify network access

### Build Failures
- Clear Docker cache: `docker system prune -a`
- Check Node.js version compatibility

### Migration Errors
- Ensure database exists
- Check database user permissions
- Run `npx prisma migrate resolve` if stuck

---

## Next Steps After Deployment

1. **Create Doctor Accounts**
   - Use Prisma Studio: `npm run db:studio`
   - Or seed script: `npm run db:seed`

2. **Test Booking Flow**
   - Visit doctor public page
   - Test appointment booking

3. **Monitor Performance**
   - Check database query times
   - Monitor API response times
   - Track booking success rate

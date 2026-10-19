# Deployment Checklist

Use this before going live.

## Required environment values

### Backend

- `MONGODB_URI` - production MongoDB connection string
- `CLIENT_URL` - your frontend domain, for example `https://your-app.com`
- `CLIENT_URLS` - comma-separated allowed frontend origins
- `JWT_ACCESS_SECRET` - strong random secret, 32+ characters
- `JWT_REFRESH_SECRET` - strong random secret, 32+ characters
- `SMTP_HOST` - mail provider host
- `SMTP_PORT` - usually `587`
- `SMTP_USER` - mail provider user
- `SMTP_PASS` - mail provider password
- `SMTP_FROM` - verified sender address
- `ADMIN_EMAIL` - admin seed email if you use the seed script
- `ADMIN_PASSWORD` - strong admin password if you use the seed script

### Frontend

- `VITE_API_BASE_URL` - backend API URL, for example `https://api.your-app.com/api`
- `VITE_SITE_URL` - public frontend URL, for example `https://your-app.com`
- `VITE_GA_MEASUREMENT_ID` - Google Analytics measurement ID if enabled
- `VITE_WHATSAPP_NUMBER` - WhatsApp number with country code

## Before deploy

1. Run `npm run build` in `frontend`
2. Verify backend starts with the production `.env`
3. Seed users only if needed with `npm run seed:test-users`
4. Confirm CORS allows only the live frontend domain
5. Confirm sitemap and robots reflect the live domain
6. Confirm SMTP sends a test email
7. Confirm MongoDB credentials are correct

## Seed users available in local workspace

- `carol.martinez@hirexo.test` - Candidate
- `david.thompson@hirexo.test` - Employer
- `elena.rodriguez@hirexo.test` - Employer
- `frank.admin@hirexo.test` - Admin

## Verified locally

- Frontend production build passes
- Backend imports pass
- Database seed script runs when `.env` is present
- npm audit reports 0 vulnerabilities

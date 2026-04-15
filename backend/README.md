# Hirexo Backend

Express + MongoDB backend scaffold for the recruitment platform.

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Run the API with `npm run dev`
4. Seed an admin account with `npm run seed:admin`

## Core Modules

- Auth: candidate/employer registration, login, refresh token, password change
- Candidates: profile, resume upload, saved jobs, applications
- Employers: company profile, dashboard, applicant review
- Jobs: public listings, employer CRUD, admin moderation
- Applications: apply, status tracking, employer review
- Admin: dashboard, user control, job approval
- Master data: categories, industries, locations, job types

## Notes

- Resume uploads are PDF-only.
- Jobs stay in `pending` review status until admin approval.
- Public job routes only return approved and active jobs.
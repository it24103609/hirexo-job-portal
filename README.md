# Hirexo Job Portal

Full-stack recruitment platform with separate workflows for candidate, employer, and admin users.

## Monorepo Structure

- `frontend/` - React + Vite application
- `backend/` - Express + MongoDB API

## Core Features

- Role-based authentication and authorization
- Candidate profile, resume upload, and job applications
- Employer company profile and job management
- Applicant review, status updates, interview scheduling
- Admin moderation, reports, blogs, and master data management
- Notifications and email triggers for key events

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or cloud)

## Backend Setup

1. Go to backend folder:
   - `cd backend`
2. Install dependencies:
   - `npm install`
3. Configure environment:
   - copy `.env.example` to `.env`
4. Run backend:
   - `npm run dev`

## Frontend Setup

1. Go to frontend folder:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Configure environment:
   - copy `.env.example` to `.env`
4. Run frontend:
   - `npm run dev`

## Build

- Frontend production build:
  - `cd frontend && npm run build`

## Notes

- Upload directory (`backend/uploads/`) is ignored for privacy and local-only file handling.
- Root-level requirement/source documents are ignored from git tracking.
- Public repository: https://github.com/it24103609/hirexo-job-portal

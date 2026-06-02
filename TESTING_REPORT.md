# Hirexo Job Portal – Testing Report

**Date:** 2026-05-28  
**Repository:** `it24103609/hirexo-job-portal`  
**Branch:** `full-project-2026-04-17`  
**Prepared by:** QA Review Draft

---

## 1) Project Summary (இப்போ என்ன வேலை நடக்குது)

Hirexo project ஒரு 3-role job portal:

- **Candidate**: register/login, profile update, jobs browse, apply, notifications பார்க்க
- **Employer**: job post/create, applications review, interview schedule, candidate communication
- **Admin**: users/jobs moderation, reports/monitoring, platform-level messages/controls

---

## 2) தற்போதைய முக்கிய கவலைகள் (Known / Reported Issues)

1. **Route issue**  
   - URL: `http://localhost:5173/employer/messages`
   - Problem: **Route not found**
   - Impact: Employer-candidate communication flow break ஆகிறது.

2. **UI inconsistency**  
   - Dashboard-களில் font size/type mismatch
   - Visual hierarchy ஒரே மாதிரி இல்லை

3. **Workflow completeness uncertain**  
   - End-to-end status transitions (Applied → Shortlisted → Interview → Selected/Rejected) முழுமையாக enforce ஆகிறதா unclear.

---

## 3) End-to-End Workflow Test Matrix

## A. Candidate Workflow

| TC ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| C-01 | Candidate signup/login | Signup → verify login | Account உருவாகி login success | ☐ |
| C-02 | Profile completion | Personal info, skills, CV upload | Profile % complete, CV saved | ☐ |
| C-03 | Job search/filter | Keyword + location + type filter | Relevant jobs மட்டும் | ☐ |
| C-04 | Apply job | Open job → Apply | Application created, success toast | ☐ |
| C-05 | Duplicate apply block | Same job மீண்டும் apply | Duplicate prevented | ☐ |
| C-06 | Application status view | My Applications | Correct live status | ☐ |
| C-07 | Notification receive | Employer schedules interview | Candidate notification visible | ☐ |
| C-08 | Messaging | Candidate message employer | Message sent + thread visible | ☐ |

## B. Employer Workflow

| TC ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| E-01 | Employer signup/login | Register employer → login | Employer dashboard access | ☐ |
| E-02 | Job post create | Title, desc, salary, deadline | Job listed & searchable | ☐ |
| E-03 | Edit/close job | Update fields / mark closed | Job state updates immediately | ☐ |
| E-04 | View applicants | Open job applicants list | Correct candidate list | ☐ |
| E-05 | Shortlist/reject | Change candidate status | Status updated + notification | ☐ |
| E-06 | Interview schedule | Set date/time/mode | Candidate receives schedule notice | ☐ |
| E-07 | Messaging page | `/employer/messages` open | Page should load (currently failing) | ❌ |
| E-08 | Final decision | Select/reject post interview | Candidate final status + notification | ☐ |

## C. Admin Workflow

| TC ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| A-01 | Admin login | Admin credentials | Admin dashboard loads | ☐ |
| A-02 | User management | Block/unblock candidate/employer | Access rules enforced | ☐ |
| A-03 | Job moderation | Remove flagged job | Job hidden from public list | ☐ |
| A-04 | Message/announcement | Send platform message | Target users receive notification | ☐ |
| A-05 | Reports view | Open analytics/report page | Counts/charts accurate | ☐ |
| A-06 | Audit checks | Important actions logged | Action trail visible | ☐ |

---

## 4) Dashboard Function Coverage Checklist

### Candidate Dashboard
- ☐ Profile view/edit
- ☐ CV upload/update/download
- ☐ Saved jobs
- ☐ Applied jobs list
- ☐ Interview notifications
- ☐ Messages
- ☐ Settings/logout

### Employer Dashboard
- ☐ Create job
- ☐ Manage posted jobs
- ☐ Applicant pipeline
- ☐ Interview scheduler
- ☐ Messages (**route fix needed**)
- ☐ Company profile
- ☐ Settings/logout

### Admin Dashboard
- ☐ User management
- ☐ Employer verification (if exists)
- ☐ Job moderation
- ☐ Announcements/notifications
- ☐ Reports/metrics
- ☐ Settings/logout

---

## 5) Incomplete / அரைகுறை Logic (Likely Gaps)

1. **Role-based route protection (RBAC)**
   - Candidate pages employer/admin open ஆகக் கூடாது.
2. **Application state machine**
   - Invalid transitions block செய்ய வேண்டும்.
3. **Interview scheduler validation**
   - Past date/time block; timezone handling தேவை.
4. **Notification reliability**
   - Status change ஒவ்வொன்றுக்கும் notification trigger இருக்க வேண்டும்.
5. **Message module**
   - Route + backend thread mapping + unread count sync.
6. **Error handling**
   - 404/500 pages consistent இல்லை.
7. **Audit logs**
   - Admin actions traceable ஆக வேண்டும்.

---

## 6) UI / Style Improvement Plan (Modern Design)

1. **Typography system**
   - Single font family (e.g., Inter / Poppins)
   - Standard scale: 12 / 14 / 16 / 20 / 24 / 32
2. **Spacing system**
   - 4px அல்லது 8px scale (4,8,12,16,24,32)
3. **Color tokens**
   - Primary, success, warning, error with accessibility contrast
4. **Reusable components**
   - Button, Input, Card, Badge, Table, Modal ஒரே style
5. **Dashboard consistency**
   - 3 dashboard-க்கும் same header/sidebar layout rules
6. **States**
   - loading / empty / error / success UI எல்லா pages-லும் வேண்டும்
7. **Responsive**
   - Mobile/tablet breakpoints verify செய்ய வேண்டும்
8. **Accessibility**
   - Keyboard nav, aria labels, focus states

---

## 7) Route Fix Priority (Immediate)

| Priority | Issue | Action |
|---|---|---|
| P0 | `/employer/messages` not found | frontend route + lazy import path + backend endpoint verify |
| P0 | Unauthorized dashboard access | route guard middleware/ProtectedRoute fix |
| P1 | Notification gaps | centralized notification service |
| P1 | Status transition mismatch | backend enum + validation layer |
| P2 | UI inconsistency | design tokens + shared components migration |

---

## 8) Recommended New Implementations

- **Email + in-app notification** for interview schedule/status update
- **Interview calendar integration** (Google Calendar ICS)
- **Advanced search** (skills, experience, salary range)
- **Saved filters & job alerts**
- **Admin audit log viewer**
- **Export reports** (CSV/PDF)
- **Rate limiting + basic security hardening** (auth endpoints)

---
<!--  -->
## 9) Test Execution Commands (Windows)

> உங்கள் project scripts பெயர் சரியாக இருந்தால் கீழே run பண்ணலாம்.

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

---

## 10) Final QA Verdict (Current)

- **Overall status:** ⚠️ **Partially complete**
- **Blocking issue:** Employer Messages route failure
- **Go-live readiness:** ❌ Not ready until P0 fixes complete
- **Next step:** Route fixes + end-to-end workflow pass + UI consistency update

---
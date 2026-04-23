import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Loader from './components/ui/Loader';
import { ROLES } from './utils/constants';

const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const JobsPage = lazy(() => import('./pages/public/JobsPage'));
const JobDetailsPage = lazy(() => import('./pages/public/JobDetailsPage'));
const CandidateRegisterPage = lazy(() => import('./pages/public/CandidateRegisterPage'));
const CandidateLoginPage = lazy(() => import('./pages/public/CandidateLoginPage'));
const EmployerRegisterPage = lazy(() => import('./pages/public/EmployerRegisterPage'));
const EmployerLoginPage = lazy(() => import('./pages/public/EmployerLoginPage'));
const AdminLoginPage = lazy(() => import('./pages/public/AdminLoginPage'));
const AuthPage = lazy(() => import('./pages/public/AuthPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const BlogListPage = lazy(() => import('./pages/public/BlogListPage'));
const BlogDetailsPage = lazy(() => import('./pages/public/BlogDetailsPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const CandidateDashboard = lazy(() => import('./pages/dashboard/CandidateDashboard'));
const CandidateProfilePage = lazy(() => import('./pages/dashboard/CandidateProfilePage'));
const CandidateResumePage = lazy(() => import('./pages/dashboard/CandidateResumePage'));
const CandidateApplicationsPage = lazy(() => import('./pages/dashboard/CandidateApplicationsPage'));
const CandidateSavedJobsPage = lazy(() => import('./pages/dashboard/CandidateSavedJobsPage'));
const EmployerDashboard = lazy(() => import('./pages/dashboard/EmployerDashboard'));
const EmployerOverviewPage = lazy(() => import('./pages/dashboard/EmployerOverviewPage'));
const EmployerCompanyProfilePage = lazy(() => import('./pages/dashboard/EmployerCompanyProfilePage'));
const EmployerJobsPage = lazy(() => import('./pages/dashboard/EmployerJobsPage'));
const EmployerJobFormPage = lazy(() => import('./pages/dashboard/EmployerJobFormPage'));
const EmployerApplicantsPage = lazy(() => import('./pages/dashboard/EmployerApplicantsPage'));
const EmployerCandidateDetailPage = lazy(() => import('./pages/dashboard/EmployerCandidateDetailPage'));
const EmployerMessagesPage = lazy(() => import('./pages/dashboard/EmployerMessagesPage'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminOverviewPage = lazy(() => import('./pages/dashboard/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('./pages/dashboard/AdminUsersPage'));
const AdminJobsModerationPage = lazy(() => import('./pages/dashboard/AdminJobsModerationPage'));
const AdminMasterDataPage = lazy(() => import('./pages/dashboard/AdminMasterDataPage'));
const AdminBlogsPage = lazy(() => import('./pages/dashboard/AdminBlogsPage'));
const AdminInquiriesPage = lazy(() => import('./pages/dashboard/AdminInquiriesPage'));
const AdminReportsPage = lazy(() => import('./pages/dashboard/AdminReportsPage'));
const AdminMessagesPage = lazy(() => import('./pages/dashboard/AdminMessagesPage'));
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

export default function App() {
  return (
    <Suspense fallback={<Loader label="Loading page..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="candidate/register" element={<CandidateRegisterPage />} />
          <Route path="candidate/login" element={<CandidateLoginPage />} />
          <Route path="employer/register" element={<EmployerRegisterPage />} />
          <Route path="employer/login" element={<EmployerLoginPage />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:slug" element={<JobDetailsPage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogDetailsPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={[ROLES.CANDIDATE]} />}>
            <Route element={<DashboardLayout role="candidate" />}>
              <Route path="candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="candidate/profile" element={<CandidateProfilePage />} />
              <Route path="candidate/resume" element={<CandidateResumePage />} />
              <Route path="candidate/applications" element={<CandidateApplicationsPage />} />
              <Route path="candidate/messages" element={<CandidateApplicationsPage />} />
              <Route path="candidate/saved-jobs" element={<CandidateSavedJobsPage />} />
              <Route path="candidate/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.EMPLOYER]} />}>
            <Route element={<DashboardLayout role="employer" />}>
              <Route path="employer/overview" element={<EmployerOverviewPage />} />
              <Route path="employer/dashboard" element={<EmployerDashboard />} />
              <Route path="employer/company-profile" element={<EmployerCompanyProfilePage />} />
              <Route path="employer/jobs" element={<EmployerJobsPage />} />
              <Route path="employer/jobs/new" element={<EmployerJobFormPage mode="create" />} />
              <Route path="employer/jobs/:id/edit" element={<EmployerJobFormPage mode="edit" />} />
              <Route path="employer/jobs/:jobId/applicants" element={<EmployerApplicantsPage />} />
              <Route path="employer/applicants/:applicationId" element={<EmployerCandidateDetailPage />} />
              <Route path="employer/messages" element={<EmployerMessagesPage />} />
              <Route path="employer/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route element={<DashboardLayout role="admin" />}>
              <Route path="admin/overview" element={<AdminOverviewPage />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/jobs" element={<AdminJobsModerationPage />} />
              <Route path="admin/master-data" element={<AdminMasterDataPage />} />
              <Route path="admin/blogs" element={<AdminBlogsPage />} />
              <Route path="admin/blogs/new" element={<AdminBlogsPage />} />
              <Route path="admin/inquiries" element={<AdminInquiriesPage />} />
              <Route path="admin/messages" element={<AdminMessagesPage />} />
              <Route path="admin/reports" element={<AdminReportsPage />} />
              <Route path="admin/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

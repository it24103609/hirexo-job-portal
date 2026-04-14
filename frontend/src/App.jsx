import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import JobsPage from './pages/public/JobsPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import CandidateRegisterPage from './pages/public/CandidateRegisterPage';
import CandidateLoginPage from './pages/public/CandidateLoginPage';
import EmployerRegisterPage from './pages/public/EmployerRegisterPage';
import EmployerLoginPage from './pages/public/EmployerLoginPage';
import AdminLoginPage from './pages/public/AdminLoginPage';
import AuthPage from './pages/public/AuthPage';
import BlogListPage from './pages/public/BlogListPage';
import BlogDetailsPage from './pages/public/BlogDetailsPage';
import ContactPage from './pages/public/ContactPage';
import CandidateDashboard from './pages/dashboard/CandidateDashboard';
import CandidateProfilePage from './pages/dashboard/CandidateProfilePage';
import CandidateResumePage from './pages/dashboard/CandidateResumePage';
import CandidateApplicationsPage from './pages/dashboard/CandidateApplicationsPage';
import CandidateSavedJobsPage from './pages/dashboard/CandidateSavedJobsPage';
import EmployerDashboard from './pages/dashboard/EmployerDashboard';
import EmployerCompanyProfilePage from './pages/dashboard/EmployerCompanyProfilePage';
import EmployerJobsPage from './pages/dashboard/EmployerJobsPage';
import EmployerJobFormPage from './pages/dashboard/EmployerJobFormPage';
import EmployerApplicantsPage from './pages/dashboard/EmployerApplicantsPage';
import EmployerCandidateDetailPage from './pages/dashboard/EmployerCandidateDetailPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminUsersPage from './pages/dashboard/AdminUsersPage';
import AdminJobsModerationPage from './pages/dashboard/AdminJobsModerationPage';
import AdminMasterDataPage from './pages/dashboard/AdminMasterDataPage';
import AdminBlogsPage from './pages/dashboard/AdminBlogsPage';
import AdminInquiriesPage from './pages/dashboard/AdminInquiriesPage';
import AdminReportsPage from './pages/dashboard/AdminReportsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import NotFoundPage from './pages/public/NotFoundPage';
import { ROLES } from './utils/constants';

export default function App() {
  return (
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
            <Route path="candidate/saved-jobs" element={<CandidateSavedJobsPage />} />
            <Route path="candidate/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={[ROLES.EMPLOYER]} />}>
          <Route element={<DashboardLayout role="employer" />}>
            <Route path="employer/dashboard" element={<EmployerDashboard />} />
            <Route path="employer/company-profile" element={<EmployerCompanyProfilePage />} />
            <Route path="employer/jobs" element={<EmployerJobsPage />} />
            <Route path="employer/jobs/new" element={<EmployerJobFormPage mode="create" />} />
            <Route path="employer/jobs/:id/edit" element={<EmployerJobFormPage mode="edit" />} />
            <Route path="employer/jobs/:jobId/applicants" element={<EmployerApplicantsPage />} />
            <Route path="employer/applicants/:applicationId" element={<EmployerCandidateDetailPage />} />
            <Route path="employer/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/jobs" element={<AdminJobsModerationPage />} />
            <Route path="admin/master-data" element={<AdminMasterDataPage />} />
            <Route path="admin/blogs" element={<AdminBlogsPage />} />
            <Route path="admin/inquiries" element={<AdminInquiriesPage />} />
            <Route path="admin/reports" element={<AdminReportsPage />} />
            <Route path="admin/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

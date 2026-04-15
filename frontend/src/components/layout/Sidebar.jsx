import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  BriefcaseBusiness,
  Bookmark,
  Bell,
  CircleHelp,
  ShieldCheck,
  Building2,
  PlusSquare,
  Users,
  FolderKanban,
  Database,
  PencilLine,
  Mail,
  BarChart3
} from 'lucide-react';
import { siteContent } from '../../data/siteContent';
import { useAuth } from '../../contexts/AuthContext';
import { candidateApi } from '../../services/candidate.api';
import BrandIdentity from './BrandIdentity';

const iconByPath = {
  '/candidate/dashboard': LayoutDashboard,
  '/candidate/profile': User,
  '/candidate/resume': FileText,
  '/candidate/applications': BriefcaseBusiness,
  '/candidate/saved-jobs': Bookmark,
  '/candidate/notifications': Bell,
  '/employer/dashboard': LayoutDashboard,
  '/employer/company-profile': Building2,
  '/employer/jobs': FolderKanban,
  '/employer/jobs/new': PlusSquare,
  '/employer/notifications': Bell,
  '/admin/dashboard': LayoutDashboard,
  '/admin/users': Users,
  '/admin/jobs': BriefcaseBusiness,
  '/admin/master-data': Database,
  '/admin/blogs': PencilLine,
  '/admin/inquiries': Mail,
  '/admin/reports': BarChart3,
  '/admin/notifications': Bell
};

function computeCandidateCompletion(profile) {
  if (!profile) return 15;

  const checks = [
    Boolean(profile.headline),
    Boolean(profile.summary),
    Boolean(profile.phone),
    Boolean(profile.location),
    Boolean(profile.experienceYears),
    Array.isArray(profile.skills) && profile.skills.length > 0
  ];

  const completed = checks.filter(Boolean).length;
  return Math.max(15, Math.round((completed / checks.length) * 100));
}

export default function Sidebar({ role }) {
  const links = siteContent.dashboardLinks[role] || [];
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState(null);

  useEffect(() => {
    if (role !== 'candidate') return;
    candidateApi.profile()
      .then((res) => setCandidateProfile(res.data || null))
      .catch(() => setCandidateProfile(null));
  }, [role]);

  const candidateCompletion = useMemo(() => computeCandidateCompletion(candidateProfile), [candidateProfile]);
  const initials = useMemo(() => {
    const name = String(user?.name || user?.email || 'Candidate').trim();
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'CA';
  }, [user]);

  return (
    <aside className={`dashboard-sidebar dashboard-sidebar-${role}`} aria-label={`${role} dashboard navigation`}>
      <div className="sidebar-brand">
        <BrandIdentity subtitle={`${role} dashboard`} />
      </div>

      {role === 'candidate' ? (
        <div className="candidate-mini-card">
          <div className="candidate-mini-top">
            <div className="candidate-avatar" aria-hidden="true">{initials}</div>
            <div>
              <strong>{user?.name || 'Candidate'}</strong>
              <p>{user?.email || 'candidate@hirexo.com'}</p>
            </div>
          </div>

          <div className="candidate-progress-wrap">
            <div className="candidate-progress-row">
              <span>Profile completion</span>
              <strong>{candidateCompletion}%</strong>
            </div>
            <div className="candidate-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={candidateCompletion}>
              <span style={{ width: `${candidateCompletion}%` }} />
            </div>
          </div>
        </div>
      ) : null}

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${role}/dashboard`}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {(() => {
              const Icon = iconByPath[link.to] || LayoutDashboard;
              return <Icon size={18} className="sidebar-link-icon" aria-hidden="true" />;
            })()}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {role === 'candidate' ? (
        <div className="sidebar-help-card">
          <CircleHelp size={18} aria-hidden="true" />
          <div>
            <strong>Need help?</strong>
            <p>Our support team is available for profile and application guidance.</p>
            <Link to="/contact">Contact support</Link>
          </div>
        </div>
      ) : null}

      {role === 'candidate' ? (
        <div className="sidebar-trust-note">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>Verified recruitment workspace</span>
        </div>
      ) : null}
    </aside>
  );
}

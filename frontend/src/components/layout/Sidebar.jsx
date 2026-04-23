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
  BarChart3,
  Sparkles,
  X,
  ListChecks,
  CalendarDays
} from 'lucide-react';
import { siteContent } from '../../data/siteContent';
import { useAuth } from '../../contexts/AuthContext';
import { candidateApi } from '../../services/candidate.api';
import BrandIdentity from './BrandIdentity';
import { useCandidateProfilePicture } from '../../hooks/useCandidateProfilePicture';

const iconByPath = {
  '/candidate/dashboard': LayoutDashboard,
  '/candidate/profile': User,
  '/candidate/resume': FileText,
  '/candidate/applications': BriefcaseBusiness,
  '/candidate/messages': Mail,
  '/candidate/saved-jobs': Bookmark,
  '/candidate/notifications': Bell,
  '/employer/overview': LayoutDashboard,
  '/employer/dashboard': LayoutDashboard,
  '/employer/company-profile': Building2,
  '/employer/jobs': FolderKanban,
  '/employer/jobs/new': PlusSquare,
  '/employer/messages': Mail,
  '/employer/notifications': Bell,
  '/admin/overview': LayoutDashboard,
  '/admin/dashboard': LayoutDashboard,
  '/admin/users': Users,
  '/admin/jobs': BriefcaseBusiness,
  '/admin/messages': Mail,
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

export default function Sidebar({ role, isOpen = false, onNavigate = () => {} }) {
  const links = siteContent.dashboardLinks[role] || [];
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState(null);
  const candidateImageUrl = useCandidateProfilePicture(candidateProfile?.profilePicture);

  useEffect(() => {
    if (role !== 'candidate') return;

    const loadCandidateProfile = () => {
      candidateApi.profile()
        .then((res) => setCandidateProfile(res.data || null))
        .catch(() => setCandidateProfile(null));
    };

    loadCandidateProfile();
    window.addEventListener('candidate-profile-updated', loadCandidateProfile);
    return () => window.removeEventListener('candidate-profile-updated', loadCandidateProfile);
  }, [role]);

  const candidateCompletion = useMemo(() => computeCandidateCompletion(candidateProfile), [candidateProfile]);
  const initials = useMemo(() => {
    const name = String(user?.name || user?.email || 'Candidate').trim();
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'CA';
  }, [user]);
  const adminGroups = useMemo(() => {
    if (role !== 'admin') return [];

    return [
      {
        label: 'Overview',
        links: links.filter((link) => ['/admin/overview', '/admin/dashboard', '/admin/messages', '/admin/reports', '/admin/notifications'].includes(link.to))
      },
      {
        label: 'Operations',
        links: links.filter((link) => ['/admin/users', '/admin/jobs', '/admin/inquiries'].includes(link.to))
      },
      {
        label: 'Content & Setup',
        links: links.filter((link) => ['/admin/blogs', '/admin/master-data'].includes(link.to))
      }
    ].filter((group) => group.links.length);
  }, [links, role]);
  const employerLinks = useMemo(() => {
    if (role !== 'employer') return [];

    return [
      { label: 'Overview', to: '/employer/overview', icon: LayoutDashboard },
      { label: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard },
      { label: 'Tracking', to: '/employer/jobs', icon: ListChecks },
      { label: 'Company Profile', to: '/employer/company-profile', icon: CalendarDays },
      { label: 'Post Job', to: '/employer/jobs/new', icon: PlusSquare },
      { label: 'Messages', to: '/employer/messages', icon: Mail },
      { label: 'Notifications', to: '/employer/notifications', icon: Bell }
    ].filter((entry) => {
      if (entry.label === 'Tracking') return links.some((link) => link.to === '/employer/jobs');
      if (entry.label === 'Company Profile') return links.some((link) => link.to === '/employer/company-profile');
      if (entry.label === 'Post Job') return links.some((link) => link.to === '/employer/jobs/new');
      if (entry.label === 'Messages') return links.some((link) => link.to === '/employer/messages');
      if (entry.label === 'Notifications') {
        return links.some((link) => link.to === '/employer/notifications');
      }
      return links.some((link) => link.to === entry.to);
    });
  }, [links, role]);

  return (
    <aside
      id="dashboard-sidebar"
      className={`dashboard-sidebar dashboard-sidebar-${role} ${isOpen ? 'is-open' : ''}`}
      aria-label={`${role} dashboard navigation`}
    >
      <div className="dashboard-sidebar-mobile-head">
        <span className="dashboard-sidebar-mobile-title">{role} menu</span>
        <button type="button" className="dashboard-sidebar-close" onClick={onNavigate} aria-label="Close dashboard navigation">
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-brand">
        <BrandIdentity subtitle={`${role} dashboard`} />
      </div>

      {role === 'admin' ? (
        <div className="admin-sidebar-identity">
          <div className="admin-sidebar-top">
            <div className="candidate-avatar admin-sidebar-avatar" aria-hidden="true">{initials}</div>
            <div>
              <span className="admin-sidebar-badge"><Sparkles size={12} /> Admin Control</span>
              <strong>{user?.name || 'Hirexo Admin'}</strong>
              <p>{user?.email || 'admin@hirexo.com'}</p>
            </div>
          </div>
          <div className="admin-sidebar-meta">
            <span>Secure moderation workspace</span>
            <span>Live platform oversight</span>
          </div>
        </div>
      ) : null}

      {role === 'candidate' ? (
        <div className="candidate-mini-card">
          <div className="candidate-mini-top">
            <div className="candidate-avatar" aria-hidden="true">
              {candidateImageUrl ? <img src={candidateImageUrl} alt="" className="candidate-avatar-image" /> : initials}
            </div>
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

      {role === 'admin' ? (
        <div className="sidebar-group-stack">
          {adminGroups.map((group) => (
            <div key={group.label} className="sidebar-group">
              <p className="sidebar-group-label">{group.label}</p>
              <nav className="sidebar-nav" aria-label={group.label}>
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === `/${role}/dashboard`}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onNavigate}
                  >
                    {(() => {
                      const Icon = iconByPath[link.to] || LayoutDashboard;
                      return <Icon size={18} className="sidebar-link-icon" aria-hidden="true" />;
                    })()}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      ) : role === 'employer' ? (
        <div className="sidebar-group-stack employer-sidebar-stack">
          <nav className="sidebar-nav employer-sidebar-nav-flat" aria-label="Employer navigation">
            {employerLinks.map((link) => (
              <NavLink
                key={`${link.label}-${link.to}`}
                to={link.to}
                end={link.to === `/${role}/dashboard`}
                className={({ isActive }) => `sidebar-link employer-sidebar-link-flat ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                {(() => {
                  const Icon = link.icon || iconByPath[link.to] || LayoutDashboard;
                  return <Icon size={18} className="sidebar-link-icon" aria-hidden="true" />;
                })()}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      ) : (
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === `/${role}/dashboard`}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onNavigate}
            >
              {(() => {
                const Icon = iconByPath[link.to] || LayoutDashboard;
                return <Icon size={18} className="sidebar-link-icon" aria-hidden="true" />;
              })()}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      {role === 'candidate' ? (
        <div className="sidebar-help-card">
          <CircleHelp size={18} aria-hidden="true" />
          <div>
            <strong>Need help?</strong>
            <p>Our support team is available for profile and application guidance.</p>
            <Link to="/contact" onClick={onNavigate}>Contact support</Link>
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

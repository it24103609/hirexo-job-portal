import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/ui/Loader';
import FloatingWhatsAppButton from '../components/ui/FloatingWhatsAppButton';
import { candidateApi } from '../services/candidate.api';
import { notificationsApi } from '../services/notifications.api';
import { useCandidateProfilePicture } from '../hooks/useCandidateProfilePicture';
import '../styles/candidate-portal.css';
import '../styles/dashboard-premium.css';

export default function DashboardLayout({ role }) {
  const { loading, isAuthenticated, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const candidateAvatarUrl = useCandidateProfilePicture(candidateProfile?.profilePicture);

  useEffect(() => {
    document.body.classList.toggle('dashboard-nav-open', sidebarOpen);
    return () => document.body.classList.remove('dashboard-nav-open');
  }, [sidebarOpen]);

  useEffect(() => {
    document.body.classList.add('dashboard-layout-active');
    return () => document.body.classList.remove('dashboard-layout-active');
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [sidebarOpen]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.mine({ limit: 1 });
      setUnreadCount(response.meta?.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (loading || !isAuthenticated || user?.role !== role) return undefined;

    loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 60000);
    return () => window.clearInterval(intervalId);
  }, [loading, isAuthenticated, loadUnreadCount, location.pathname, role, user?.role]);

  useEffect(() => {
    if (role !== 'candidate') {
      setCandidateProfile(null);
      return undefined;
    }

    let active = true;

    candidateApi.profile()
      .then((response) => {
        if (!active) return;
        setCandidateProfile(response.data || null);
      })
      .catch(() => {
        if (!active) return;
        setCandidateProfile(null);
      });

    return () => {
      active = false;
    };
  }, [role, user?.id]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!profileDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileDropdownOpen]);

  const handleProfileClick = useCallback(() => {
    setProfileDropdownOpen((prev) => !prev);
  }, []);

  const handleProfileNavigation = useCallback((path) => {
    setProfileDropdownOpen(false);
    navigate(path);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setProfileDropdownOpen(false);
    logout();
    navigate(
      role === 'admin'
        ? '/admin/login'
        : role === 'employer'
          ? '/employer/login'
          : '/candidate/login',
      { replace: true }
    );
  }, [logout, navigate, role]);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!isAuthenticated || user?.role !== role) return <Navigate to="/" replace />;

  const getDashboardPath = (r) => {
    if (r === 'employer') return '/employer/company-profile';
    if (r === 'candidate') return '/candidate/profile';
    if (r === 'admin') return '/admin/profile';
    return '/';
  };

  const getNotificationsPath = (r) => `/${r}/notifications`;
  const getSettingsPath = (r) => `/${r}/policies`;
  const profileImageSrc = useMemo(() => {
    if (user?.profileImage) return user.profileImage;
    if (role === 'candidate' && candidateAvatarUrl) return candidateAvatarUrl;
    return '';
  }, [candidateAvatarUrl, role, user?.profileImage]);
  const profileInitial = String(user?.name || user?.email || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <>
      <div className="dashboard-mobile-bar shell">
        <button
          className="dashboard-mobile-trigger"
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          aria-expanded={sidebarOpen}
          aria-controls="dashboard-sidebar"
          aria-label={`${sidebarOpen ? 'Close' : 'Open'} ${role} dashboard menu`}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          <span>{sidebarOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <div className={`dashboard-shell ${role === 'candidate' ? 'candidate-portal-shell' : ''} ${role === 'employer' ? 'employer-portal-shell' : ''} ${role === 'admin' ? 'admin-portal-shell' : ''} ${sidebarOpen ? 'mobile-nav-open' : ''}`}>
        <Sidebar role={role} isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <div className={`dashboard-main ${role === 'candidate' ? 'candidate-portal-main' : ''} ${role === 'employer' ? 'employer-portal-main' : ''} ${role === 'admin' ? 'admin-portal-main' : ''}`}>
          <div className="dashboard-topbar">
            <div className="dashboard-topbar-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder={
                  role === 'admin'
                    ? 'Search the admin console'
                    : role === 'employer'
                      ? 'Search employer workspace'
                      : 'Search candidate dashboard'
                }
                aria-label={
                  role === 'admin'
                    ? 'Search the admin console'
                    : role === 'employer'
                      ? 'Search employer workspace'
                      : 'Search candidate dashboard'
                }
              />
            </div>
            <div className="dashboard-topbar-actions">
              <button
                type="button"
                className="dashboard-icon-btn"
                aria-label="Open notifications"
                onClick={() => navigate(getNotificationsPath(role))}
              >
                <Bell size={18} />
                <span>{unreadCount > 99 ? '99+' : unreadCount}</span>
              </button>
              <button
                type="button"
                className="dashboard-icon-btn"
                aria-label="Open settings"
                onClick={() => navigate(getSettingsPath(role))}
              >
                <Settings size={18} />
              </button>
              <div className="dashboard-profile-pill-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="dashboard-profile-pill"
                  onClick={handleProfileClick}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Profile menu"
                >
                  <span className="dashboard-profile-avatar">
                    {profileImageSrc ? (
                      <img src={profileImageSrc} alt="" aria-hidden="true" />
                    ) : (
                      profileInitial
                    )}
                  </span>
                  <div className="dashboard-profile-info">
                    <strong>{user?.name || 'User'}</strong>
                    <small>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}</small>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`dashboard-profile-chevron ${profileDropdownOpen ? 'is-open' : ''}`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="dashboard-profile-dropdown" role="menu">
                    <button
                      type="button"
                      className="dashboard-profile-dropdown-item"
                      onClick={() => handleProfileNavigation(getDashboardPath(role))}
                      role="menuitem"
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </button>
                    <button
                      type="button"
                      className="dashboard-profile-dropdown-item"
                      onClick={() => handleProfileNavigation(`/${role}/settings`)}
                      role="menuitem"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <div className="dashboard-profile-dropdown-divider" />
                    <button
                      type="button"
                      className="dashboard-profile-dropdown-item dashboard-profile-dropdown-item--danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
      <button
        type="button"
        className={`dashboard-sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close dashboard menu"
      />
         
      
      {location.pathname !== '/employer/messages' &&
 location.pathname !== '/candidate/messages' && (
  <FloatingWhatsAppButton />
)}
    </>
  );
}

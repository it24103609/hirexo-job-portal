import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell, Settings } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/ui/Loader';
import FloatingWhatsAppButton from '../components/ui/FloatingWhatsAppButton';
import '../styles/candidate-portal.css';
import '../styles/dashboard-premium.css';

export default function DashboardLayout({ role }) {
  const { loading, isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!isAuthenticated || user?.role !== role) return <Navigate to="/" replace />;

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
              <button type="button" className="dashboard-icon-btn" aria-label="Open notifications">
                <Bell size={18} />
                <span>4</span>
              </button>
              <button type="button" className="dashboard-icon-btn" aria-label="Open settings">
                <Settings size={18} />
              </button>
              <div className="dashboard-profile-pill">
                <span>{String(user?.name || 'U').slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{user?.name || 'User'}</strong>
                  <small>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}</small>
                </div>
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
      <FloatingWhatsAppButton />
    </>
  );
}

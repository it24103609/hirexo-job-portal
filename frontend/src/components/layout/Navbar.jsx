import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import Button from '../ui/Button';
import BrandIdentity from './BrandIdentity';
import { useAuth } from '../../contexts/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/jobs', label: 'Find Jobs' },
  { to: '/blog', label: 'Blog' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'employer'
      ? '/employer/dashboard'
      : '/candidate/dashboard';

  return (
    <header className="site-header">
      <nav className="navbar shell">
        <BrandIdentity />

        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className={`nav-panel ${open ? 'is-open' : ''}`}>
          <div className="nav-links">
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Button as={Link} to={dashboardPath} size="sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut size={16} /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/auth" variant="secondary" size="sm">
                  <LogIn size={16} /> Login
                </Button>
                <Button as={Link} to="/auth" size="sm">
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

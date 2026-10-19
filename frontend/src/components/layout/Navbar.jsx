import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, LayoutDashboard, LogOut, LogIn, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import BrandIdentity from './BrandIdentity';
import { useAuth } from '../../contexts/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Hexora Group' },
  { to: '/jobs', label: 'Careers ' },
  { to: '/contact', label: 'Contact' }
];

const companiesSubLinks = [
  { to: '/companies/talent', label: 'HEXORA TALENT' },
  { to: '/companies/hr-consulting', label: 'HEXORA HR CONSULTING' },
  { to: '/companies/global-trade', label: 'HEXORA GLOBAL TRADE' },
  { to: '/companies/foods', label: 'HEXORA FOODS' },
  { to: '/companies/business-solutions', label: 'HEXORA BUSINESS SOLUTIONS' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setCompaniesOpen(false);
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

        <div className={`nav-panel ${open ? 'is-open' : ''}`}>
          <div className="nav-links">
            {publicLinks.slice(0, 2).map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}

            {/* Business divisions dropdown */}
            <div className={`nav-dropdown nav-dropdown--split ${companiesOpen ? 'is-open' : ''}`}>
              <NavLink
                to="/services"
                className="nav-dropdown-trigger nav-dropdown-trigger-link"
                onClick={() => { setOpen(false); setCompaniesOpen(false); }}
              >
                Our Businesses
              </NavLink>
              <button
                type="button"
                className="nav-dropdown-toggle"
                onClick={() => setCompaniesOpen((value) => !value)}
                aria-expanded={companiesOpen}
                aria-haspopup="true"
                aria-label="Toggle business divisions menu"
              >
                <ChevronDown size={15} className="nav-dropdown-chevron" />
              </button>
              <div className="nav-dropdown-menu">
                {companiesSubLinks.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    onClick={() => { setOpen(false); setCompaniesOpen(false); }}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>

            {publicLinks.slice(2).map((link) => (
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
                  Get Started <ArrowRight size={16} />
                </Button>
              </>
            )}
          </div>
        </div>

        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
    </header>
  );
}

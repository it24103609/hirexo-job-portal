import { NavLink } from 'react-router-dom';
import { siteContent } from '../../data/siteContent';
import BrandIdentity from './BrandIdentity';

export default function Sidebar({ role }) {
  const links = siteContent.dashboardLinks[role] || [];

  return (
    <aside className="dashboard-sidebar" aria-label={`${role} dashboard navigation`}>
      <div className="sidebar-brand">
        <BrandIdentity subtitle={`${role} dashboard`} />
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === `/${role}/dashboard`}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

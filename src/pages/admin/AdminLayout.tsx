import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Radio, Tag, RefreshCw, Pickaxe } from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/stations', label: 'Stations', icon: Radio, end: false },
  { to: '/admin/tags', label: 'Tags', icon: Tag, end: false },
  { to: '/admin/etl', label: 'ETL', icon: RefreshCw, end: false },
  { to: '/admin/dig', label: 'Dig', icon: Pickaxe, end: false },
];

export function AdminLayout() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="tabs tabs-boxed mb-6">
        {adminNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `tab gap-2 ${isActive ? 'tab-active' : ''}`}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

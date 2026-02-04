import { NavLink } from 'react-router-dom';
import { Home, Search, Globe, Map, Heart, Clock, Radio, X } from 'lucide-react';
import { ThemePicker } from '@/components/ui/ThemePicker';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/countries', icon: Globe, label: 'Countries' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/history', icon: Clock, label: 'History' },
];

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-base-300">
        <div className="flex items-center gap-2 text-lg font-bold text-primary">
          <Radio size={22} />
          <span>World Radio</span>
        </div>
        <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <ul className="menu flex-1 p-2">
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="p-3 border-t border-base-300">
        <ThemePicker />
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Search, Globe, Map, Heart, Clock, Radio } from 'lucide-react';
import { ThemePicker } from '@/components/ui/ThemePicker';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/countries', icon: Globe, label: 'Countries' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/history', icon: Clock, label: 'History' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Radio size={24} />
        <span>World Radio</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.spacer} />
      <ThemePicker />
    </aside>
  );
}

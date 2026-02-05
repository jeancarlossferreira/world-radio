import { NavLink } from 'react-router-dom';
import { Home, Search, Globe, Map, Heart, Clock, Radio, X } from 'lucide-react';
import { SettingsSection } from '@/components/ui/SettingsSection';
import { useI18n } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/types';

const navItems: { to: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { to: '/', icon: Home, labelKey: 'nav.home' },
  { to: '/search', icon: Search, labelKey: 'nav.search' },
  { to: '/countries', icon: Globe, labelKey: 'nav.countries' },
  { to: '/map', icon: Map, labelKey: 'nav.map' },
  { to: '/favorites', icon: Heart, labelKey: 'nav.favorites' },
  { to: '/history', icon: Clock, labelKey: 'nav.history' },
];

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-base-300">
        <div className="flex items-center gap-2 text-lg font-bold text-primary">
          <Radio size={22} />
          <span>{t('app.name')}</span>
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
              {t(item.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
      <SettingsSection />
    </div>
  );
}

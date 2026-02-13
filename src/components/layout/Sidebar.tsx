import { NavLink } from 'react-router-dom';
import { Home, Search, Globe, Map, Heart, Clock, ChevronLeft, ChevronRight, Settings, Shield } from 'lucide-react';
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
  { to: '/admin', icon: Shield, labelKey: 'nav.admin' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-4 border-b border-base-300`}>
        <button
          className="btn btn-ghost btn-circle btn-sm text-primary"
          onClick={onToggle}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
        {!collapsed && (
          <span className="text-lg font-bold text-primary">{t('app.name')}</span>
        )}
      </div>
      <ul className={`flex-1 ${collapsed ? 'flex flex-col items-center gap-1 py-2' : 'menu p-2'}`}>
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                collapsed
                  ? `btn btn-ghost btn-square btn-sm ${isActive ? 'btn-active' : ''}`
                  : `${isActive ? 'active' : ''}`
              }
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <item.icon size={18} />
              {!collapsed && t(item.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
      {collapsed ? (
        <div className="flex justify-center py-2 border-t border-base-300">
          <button
            className="btn btn-ghost btn-square btn-sm"
            onClick={onToggle}
            title={t('settings.title')}
          >
            <Settings size={18} />
          </button>
        </div>
      ) : (
        <SettingsSection />
      )}
    </div>
  );
}

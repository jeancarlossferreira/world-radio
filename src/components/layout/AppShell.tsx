import { useState, useEffect, useRef } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { usePlayer } from '@/context/PlayerContext';
import { getStationByUUID } from '@/lib/api';

const SIDEBAR_WIDTH_EXPANDED = 240; // 15rem = 240px
const SIDEBAR_WIDTH_COLLAPSED = 56; // 3.5rem = 56px

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored !== 'false'; // Default to collapsed
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { play } = usePlayer();
  const handledRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const stationId = searchParams.get('station');
    if (!stationId || handledRef.current) return;
    handledRef.current = true;

    getStationByUUID(stationId).then(station => {
      if (station) play(station);
      searchParams.delete('station');
      setSearchParams(searchParams, { replace: true });
    });
  }, [searchParams, setSearchParams, play]);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="h-full flex">
      {/* Sidebar - always visible, collapsible */}
      <aside
        className="fixed top-0 bottom-[72px] left-0 z-[1100] bg-base-200 border-r border-base-300 transition-all duration-200 ease-in-out"
        style={{ width: sidebarWidth }}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </aside>

      {/* Main content */}
      <div
        className="flex flex-col flex-1 h-full transition-all duration-200 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Main content - padding bottom for player bar */}
        <main className="flex-1 overflow-y-auto bg-base-100 pb-[72px]">
          <Outlet />
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}

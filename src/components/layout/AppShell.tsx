import { useState, useEffect, useRef } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { usePlayer } from '@/context/PlayerContext';
import { getStationByUUID } from '@/lib/api';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { play } = usePlayer();
  const handledRef = useRef(false);

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

  return (
    <div className="h-full flex">
      {/* Sidebar - stops above player bar */}
      <aside
        className={`fixed top-0 bottom-[72px] left-0 z-[1100] w-60 bg-base-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>


      {/* Main content */}
      <div className="flex flex-col flex-1 h-full">
        {/* Header with menu button */}
        <header className="navbar bg-base-200 border-b border-base-300 px-2 min-h-14 shrink-0 z-10">
          <button
            className="btn btn-ghost btn-square btn-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <img src="/logo.png" alt="AstroTune" className="h-8 ml-2" />
        </header>
        {/* Main content - padding bottom for player bar */}
        <main className="flex-1 overflow-y-auto bg-base-100 pb-[72px]">
          <Outlet />
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { usePlayer } from '@/context/PlayerContext';
import styles from './AppShell.module.css';

export function AppShell() {
  const { currentStation } = usePlayer();

  return (
    <div className={`${styles.shell} ${currentStation ? styles.hasPlayer : ''}`}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}

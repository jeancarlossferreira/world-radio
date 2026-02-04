import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from '@/context/PlayerContext';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { CountryListPage } from '@/pages/CountryListPage';
import { CountryDetailPage } from '@/pages/CountryDetailPage';
import { MapPage } from '@/pages/MapPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { HistoryPage } from '@/pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/countries" element={<CountryListPage />} />
            <Route path="/countries/:code" element={<CountryDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/context/I18nContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { MapFocusProvider } from '@/context/MapFocusContext';
import { MapThemeProvider } from '@/context/MapThemeContext';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { CountryListPage } from '@/pages/CountryListPage';
import { CountryDetailPage } from '@/pages/CountryDetailPage';
import { MapPage } from '@/pages/MapPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminStations } from '@/pages/admin/AdminStations';
import { AdminStationForm } from '@/pages/admin/AdminStationForm';
import { AdminEtl } from '@/pages/admin/AdminEtl';
import { AdminTags } from '@/pages/admin/AdminTags';
import { AdminDig } from '@/pages/admin/AdminDig';

function App() {
  return (
    <I18nProvider>
      <MapThemeProvider>
      <BrowserRouter>
        <PlayerProvider>
        <MapFocusProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/countries" element={<CountryListPage />} />
              <Route path="/countries/:code" element={<CountryDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="stations" element={<AdminStations />} />
                <Route path="stations/new" element={<AdminStationForm />} />
                <Route path="stations/:uuid/edit" element={<AdminStationForm />} />
                <Route path="tags" element={<AdminTags />} />
                <Route path="etl" element={<AdminEtl />} />
                <Route path="dig" element={<AdminDig />} />
              </Route>
            </Route>
          </Routes>
        </MapFocusProvider>
        </PlayerProvider>
      </BrowserRouter>
      </MapThemeProvider>
    </I18nProvider>
  );
}

export default App;

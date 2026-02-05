export interface TranslationStrings {
  // App
  'app.name': string;
  'app.tagline': string;

  // Navigation
  'nav.home': string;
  'nav.search': string;
  'nav.countries': string;
  'nav.map': string;
  'nav.favorites': string;
  'nav.history': string;

  // Page titles
  'page.searchStations': string;
  'page.favorites': string;
  'page.history': string;
  'page.browseByCountry': string;
  'page.browseByGenre': string;
  'page.trendingStations': string;

  // Search & Filters
  'search.placeholder': string;
  'search.placeholderHome': string;
  'filter.filters': string;
  'filter.genreTag': string;
  'filter.country': string;
  'filter.codec': string;
  'filter.codecAny': string;
  'filter.genrePlaceholder': string;
  'filter.countryPlaceholder': string;
  'filter.filterCountries': string;
  'filter.sortBy': string;
  'filter.continent': string;
  'filter.continentAll': string;

  // Sort options
  'sort.name': string;
  'sort.stations': string;
  'sort.language': string;
  'sort.continent': string;

  // Buttons & Actions
  'action.retry': string;
  'action.loadMore': string;
  'action.loading': string;
  'action.clearHistory': string;
  'action.allCountries': string;
  'action.stop': string;
  'action.showOnMap': string;
  'action.locateOnMap': string;
  'action.addToFavorites': string;
  'action.removeFromFavorites': string;
  'action.share': string;

  // Empty states
  'empty.noStationsFound': string;
  'empty.noStationsFoundDesc': string;
  'empty.noFavorites': string;
  'empty.noFavoritesDesc': string;
  'empty.noHistory': string;
  'empty.noHistoryDesc': string;

  // Player
  'player.noStation': string;
  'player.connecting': string;

  // Settings
  'settings.title': string;
  'settings.theme': string;
  'settings.language': string;

  // Countries
  'countries.count': string;
  'stations.count': string;
}

export type TranslationKey = keyof TranslationStrings;

export type Locale = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi';

export interface LocaleInfo {
  code: Locale;
  name: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
}

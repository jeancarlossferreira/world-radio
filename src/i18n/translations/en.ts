import type { TranslationStrings } from '../types';

export const en: TranslationStrings = {
  // App
  'app.name': 'World Radio',
  'app.tagline': 'Listen to radio stations from around the world',

  // Navigation
  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.countries': 'Countries',
  'nav.map': 'Map',
  'nav.favorites': 'Favorites',
  'nav.history': 'History',

  // Page titles
  'page.searchStations': 'Search Stations',
  'page.favorites': 'Favorites',
  'page.history': 'History',
  'page.browseByCountry': 'Browse by Country',
  'page.browseByGenre': 'Browse by Genre',
  'page.trendingStations': 'Trending Stations',

  // Search & Filters
  'search.placeholder': 'Search stations...',
  'search.placeholderHome': 'Search for stations, genres, or countries...',
  'filter.filters': 'Filters',
  'filter.genreTag': 'Genre / Tag',
  'filter.country': 'Country',
  'filter.codec': 'Codec',
  'filter.codecAny': 'Any',
  'filter.genrePlaceholder': 'e.g. rock, jazz',
  'filter.countryPlaceholder': 'e.g. Brazil, Germany',
  'filter.filterCountries': 'Filter countries...',
  'filter.sortBy': 'Sort by',
  'filter.continent': 'Continent',
  'filter.continentAll': 'All',

  // Sort options
  'sort.name': 'Name',
  'sort.stations': 'Stations',
  'sort.language': 'Language',
  'sort.continent': 'Continent',

  // Buttons & Actions
  'action.retry': 'Retry',
  'action.loadMore': 'Load More',
  'action.loading': 'Loading...',
  'action.clearHistory': 'Clear History',
  'action.allCountries': 'All Countries',
  'action.stop': 'Stop',
  'action.showOnMap': 'Show on map',
  'action.locateOnMap': 'Locate on map',
  'action.addToFavorites': 'Add to favorites',
  'action.removeFromFavorites': 'Remove from favorites',

  // Empty states
  'empty.noStationsFound': 'No stations found',
  'empty.noStationsFoundDesc': 'Try different search terms or adjust filters',
  'empty.noFavorites': 'No favorites yet',
  'empty.noFavoritesDesc': 'Click the heart icon on any station to save it here',
  'empty.noHistory': 'No history yet',
  'empty.noHistoryDesc': 'Stations you play will appear here',

  // Player
  'player.noStation': 'No station selected',
  'player.connecting': 'Connecting...',

  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.language': 'Language',

  // Countries
  'countries.count': '{{count}} countries with radio stations',
  'stations.count': '{{count}} station{{plural}}',
};

import type { TranslationStrings } from '../types';

export const fr: TranslationStrings = {
  // App
  'app.name': 'Radio Mondiale',
  'app.tagline': 'Écoutez des stations de radio du monde entier',

  // Navigation
  'nav.home': 'Accueil',
  'nav.search': 'Rechercher',
  'nav.countries': 'Pays',
  'nav.map': 'Carte',
  'nav.favorites': 'Favoris',
  'nav.history': 'Historique',

  // Page titles
  'page.searchStations': 'Rechercher des Stations',
  'page.favorites': 'Favoris',
  'page.history': 'Historique',
  'page.browseByCountry': 'Parcourir par Pays',
  'page.browseByGenre': 'Parcourir par Genre',
  'page.trendingStations': 'Stations Tendances',

  // Search & Filters
  'search.placeholder': 'Rechercher des stations...',
  'search.placeholderHome': 'Rechercher stations, genres ou pays...',
  'filter.filters': 'Filtres',
  'filter.genreTag': 'Genre / Tag',
  'filter.country': 'Pays',
  'filter.codec': 'Codec',
  'filter.codecAny': 'Tous',
  'filter.genrePlaceholder': 'ex. rock, jazz',
  'filter.countryPlaceholder': 'ex. Brésil, Allemagne',
  'filter.filterCountries': 'Filtrer les pays...',
  'filter.sortBy': 'Trier par',
  'filter.continent': 'Continent',
  'filter.continentAll': 'Tous',

  // Sort options
  'sort.name': 'Nom',
  'sort.stations': 'Stations',
  'sort.language': 'Langue',
  'sort.continent': 'Continent',

  // Buttons & Actions
  'action.retry': 'Réessayer',
  'action.loadMore': 'Charger Plus',
  'action.loading': 'Chargement...',
  'action.clearHistory': 'Effacer l\'Historique',
  'action.allCountries': 'Tous les Pays',
  'action.stop': 'Arrêter',
  'action.showOnMap': 'Afficher sur la carte',
  'action.locateOnMap': 'Localiser sur la carte',
  'action.addToFavorites': 'Ajouter aux favoris',
  'action.removeFromFavorites': 'Retirer des favoris',
  'action.share': 'Partager',

  // Empty states
  'empty.noStationsFound': 'Aucune station trouvée',
  'empty.noStationsFoundDesc': 'Essayez d\'autres termes ou ajustez les filtres',
  'empty.noFavorites': 'Pas encore de favoris',
  'empty.noFavoritesDesc': 'Cliquez sur le cœur d\'une station pour la sauvegarder ici',
  'empty.noHistory': 'Pas encore d\'historique',
  'empty.noHistoryDesc': 'Les stations que vous écoutez apparaîtront ici',

  // Player
  'player.noStation': 'Aucune station sélectionnée',
  'player.connecting': 'Connexion...',

  // Settings
  'settings.title': 'Paramètres',
  'settings.theme': 'Thème',
  'settings.language': 'Langue',

  // Countries
  'countries.count': '{{count}} pays avec des stations de radio',
  'stations.count': '{{count}} station{{plural}}',
};

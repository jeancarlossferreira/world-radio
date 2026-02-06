import type { TranslationStrings } from '../types';

export const es: TranslationStrings = {
  // App
  'app.name': 'AstroTune',
  'app.tagline': 'Escucha estaciones de radio de todo el mundo',

  // Navigation
  'nav.home': 'Inicio',
  'nav.search': 'Buscar',
  'nav.countries': 'Países',
  'nav.map': 'Mapa',
  'nav.favorites': 'Favoritos',
  'nav.history': 'Historial',

  // Page titles
  'page.searchStations': 'Buscar Estaciones',
  'page.favorites': 'Favoritos',
  'page.history': 'Historial',
  'page.browseByCountry': 'Explorar por País',
  'page.browseByGenre': 'Explorar por Género',
  'page.trendingStations': 'Estaciones Populares',

  // Search & Filters
  'search.placeholder': 'Buscar estaciones...',
  'search.placeholderHome': 'Buscar estaciones, géneros o países...',
  'filter.filters': 'Filtros',
  'filter.genreTag': 'Género / Etiqueta',
  'filter.country': 'País',
  'filter.codec': 'Códec',
  'filter.codecAny': 'Cualquiera',
  'filter.genrePlaceholder': 'ej. rock, jazz',
  'filter.countryPlaceholder': 'ej. Brasil, Alemania',
  'filter.filterCountries': 'Filtrar países...',
  'filter.sortBy': 'Ordenar por',
  'filter.continent': 'Continente',
  'filter.continentAll': 'Todos',

  // Sort options
  'sort.name': 'Nombre',
  'sort.stations': 'Estaciones',
  'sort.language': 'Idioma',
  'sort.continent': 'Continente',

  // Buttons & Actions
  'action.retry': 'Reintentar',
  'action.loadMore': 'Cargar Más',
  'action.loading': 'Cargando...',
  'action.clearHistory': 'Borrar Historial',
  'action.allCountries': 'Todos los Países',
  'action.stop': 'Detener',
  'action.showOnMap': 'Mostrar en mapa',
  'action.locateOnMap': 'Localizar en mapa',
  'action.addToFavorites': 'Añadir a favoritos',
  'action.removeFromFavorites': 'Quitar de favoritos',
  'action.share': 'Compartir',
  'action.copyLink': 'Copiar enlace',
  'action.qrCode': 'Código QR',
  'action.shareNative': 'Más opciones',
  'action.shareEmail': 'Correo',
  'action.shareWhatsApp': 'WhatsApp',
  'action.shareTelegram': 'Telegram',
  'action.shareDiscord': 'Discord',
  'action.shareGoogleChat': 'Google Chat',

  // Empty states
  'empty.noStationsFound': 'No se encontraron estaciones',
  'empty.noStationsFoundDesc': 'Intenta con otros términos o ajusta los filtros',
  'empty.noFavorites': 'Sin favoritos aún',
  'empty.noFavoritesDesc': 'Haz clic en el corazón de cualquier estación para guardarla aquí',
  'empty.noHistory': 'Sin historial aún',
  'empty.noHistoryDesc': 'Las estaciones que reproduzcas aparecerán aquí',

  // Player
  'player.noStation': 'Ninguna estación seleccionada',
  'player.connecting': 'Conectando...',

  // Settings
  'settings.title': 'Configuración',
  'settings.theme': 'Tema',
  'settings.language': 'Idioma',
  'settings.mapTheme': 'Estilo del mapa',

  // Countries
  'countries.count': '{{count}} países con estaciones de radio',
  'stations.count': '{{count}} estación{{plural}}',
};

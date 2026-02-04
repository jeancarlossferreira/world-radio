export const API_BASE = 'https://de1.api.radio-browser.info';

export const STORAGE_KEYS = {
  FAVORITES: 'radio_favorites',
  HISTORY: 'radio_history',
  THEME: 'radio_theme',
} as const;

export const MAX_FAVORITES = 200;
export const MAX_HISTORY = 500;
export const DEFAULT_PAGE_SIZE = 30;

export const GENRE_TAGS = [
  'rock', 'pop', 'jazz', 'classical', 'electronic', 'hip hop',
  'country', 'blues', 'metal', 'reggae', 'soul', 'r&b',
  'latin', 'folk', 'punk', 'ambient', 'dance', 'house',
  'techno', 'trance', 'drum and bass', 'indie', 'alternative',
  'news', 'talk', 'sports', 'oldies', 'chillout', 'lounge',
] as const;

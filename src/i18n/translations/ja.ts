import type { TranslationStrings } from '../types';

export const ja: TranslationStrings = {
  // App
  'app.name': 'ワールドラジオ',
  'app.tagline': '世界中のラジオ局を聴こう',

  // Navigation
  'nav.home': 'ホーム',
  'nav.search': '検索',
  'nav.countries': '国',
  'nav.map': '地図',
  'nav.favorites': 'お気に入り',
  'nav.history': '履歴',

  // Page titles
  'page.searchStations': '放送局を検索',
  'page.favorites': 'お気に入り',
  'page.history': '履歴',
  'page.browseByCountry': '国別に探す',
  'page.browseByGenre': 'ジャンル別に探す',
  'page.trendingStations': '人気の放送局',

  // Search & Filters
  'search.placeholder': '放送局を検索...',
  'search.placeholderHome': '放送局、ジャンル、国を検索...',
  'filter.filters': 'フィルター',
  'filter.genreTag': 'ジャンル / タグ',
  'filter.country': '国',
  'filter.codec': 'コーデック',
  'filter.codecAny': 'すべて',
  'filter.genrePlaceholder': '例: ロック, ジャズ',
  'filter.countryPlaceholder': '例: ブラジル, ドイツ',
  'filter.filterCountries': '国を絞り込む...',
  'filter.sortBy': '並べ替え',
  'filter.continent': '大陸',
  'filter.continentAll': 'すべて',

  // Sort options
  'sort.name': '名前',
  'sort.stations': '放送局数',
  'sort.language': '言語',
  'sort.continent': '大陸',

  // Buttons & Actions
  'action.retry': '再試行',
  'action.loadMore': 'もっと読み込む',
  'action.loading': '読み込み中...',
  'action.clearHistory': '履歴をクリア',
  'action.allCountries': 'すべての国',
  'action.stop': '停止',
  'action.showOnMap': '地図で表示',
  'action.locateOnMap': '地図で位置を確認',
  'action.addToFavorites': 'お気に入りに追加',
  'action.removeFromFavorites': 'お気に入りから削除',

  // Empty states
  'empty.noStationsFound': '放送局が見つかりません',
  'empty.noStationsFoundDesc': '別のキーワードやフィルターをお試しください',
  'empty.noFavorites': 'お気に入りはまだありません',
  'empty.noFavoritesDesc': 'ハートアイコンをクリックして放送局を保存しましょう',
  'empty.noHistory': '履歴はまだありません',
  'empty.noHistoryDesc': '再生した放送局がここに表示されます',

  // Player
  'player.noStation': '放送局が選択されていません',
  'player.connecting': '接続中...',

  // Settings
  'settings.title': '設定',
  'settings.theme': 'テーマ',
  'settings.language': '言語',

  // Countries
  'countries.count': '{{count}}か国のラジオ局',
  'stations.count': '{{count}}局',
};

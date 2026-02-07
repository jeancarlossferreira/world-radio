/**
 * @fileoverview Localization utilities for country names and genres.
 *
 * Uses the browser's Intl.DisplayNames API for country name translation
 * and provides common genre translations.
 */

import type { Locale } from '@/i18n/types';

/**
 * Cache for Intl.DisplayNames instances per locale.
 * Creating these is expensive, so we cache them.
 */
const displayNamesCache = new Map<string, Intl.DisplayNames>();

/**
 * Gets a localized country name using the browser's Intl API.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'BR')
 * @param locale - The target locale for translation
 * @returns The localized country name, or the code if translation fails
 *
 * @example
 * getLocalizedCountryName('US', 'pt'); // 'Estados Unidos'
 * getLocalizedCountryName('BR', 'de'); // 'Brasilien'
 */
export function getLocalizedCountryName(countryCode: string, locale: Locale): string {
  if (!countryCode || countryCode.length !== 2) {
    return countryCode;
  }

  try {
    let displayNames = displayNamesCache.get(locale);
    if (!displayNames) {
      displayNames = new Intl.DisplayNames([locale], { type: 'region' });
      displayNamesCache.set(locale, displayNames);
    }
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode;
  }
}

/**
 * Common genre/tag translations.
 * Only the most common genres are translated; others pass through as-is.
 */
const GENRE_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  // Music genres
  'pop': { en: 'Pop', es: 'Pop', pt: 'Pop', fr: 'Pop', de: 'Pop', it: 'Pop', ru: 'Поп', zh: '流行', ja: 'ポップ', ko: '팝', ar: 'بوب', hi: 'पॉप' },
  'rock': { en: 'Rock', es: 'Rock', pt: 'Rock', fr: 'Rock', de: 'Rock', it: 'Rock', ru: 'Рок', zh: '摇滚', ja: 'ロック', ko: '록', ar: 'روك', hi: 'रॉक' },
  'jazz': { en: 'Jazz', es: 'Jazz', pt: 'Jazz', fr: 'Jazz', de: 'Jazz', it: 'Jazz', ru: 'Джаз', zh: '爵士', ja: 'ジャズ', ko: '재즈', ar: 'جاز', hi: 'जैज़' },
  'classical': { en: 'Classical', es: 'Clásica', pt: 'Clássica', fr: 'Classique', de: 'Klassik', it: 'Classica', ru: 'Классика', zh: '古典', ja: 'クラシック', ko: '클래식', ar: 'كلاسيكي', hi: 'शास्त्रीय' },
  'electronic': { en: 'Electronic', es: 'Electrónica', pt: 'Eletrônica', fr: 'Électronique', de: 'Elektronisch', it: 'Elettronica', ru: 'Электронная', zh: '电子', ja: 'エレクトロニック', ko: '일렉트로닉', ar: 'إلكتروني', hi: 'इलेक्ट्रॉनिक' },
  'dance': { en: 'Dance', es: 'Dance', pt: 'Dance', fr: 'Dance', de: 'Dance', it: 'Dance', ru: 'Танцевальная', zh: '舞曲', ja: 'ダンス', ko: '댄스', ar: 'رقص', hi: 'डांस' },
  'hip hop': { en: 'Hip Hop', es: 'Hip Hop', pt: 'Hip Hop', fr: 'Hip Hop', de: 'Hip Hop', it: 'Hip Hop', ru: 'Хип-хоп', zh: '嘻哈', ja: 'ヒップホップ', ko: '힙합', ar: 'هيب هوب', hi: 'हिप हॉप' },
  'r&b': { en: 'R&B', es: 'R&B', pt: 'R&B', fr: 'R&B', de: 'R&B', it: 'R&B', ru: 'R&B', zh: 'R&B', ja: 'R&B', ko: 'R&B', ar: 'R&B', hi: 'R&B' },
  'country': { en: 'Country', es: 'Country', pt: 'Country', fr: 'Country', de: 'Country', it: 'Country', ru: 'Кантри', zh: '乡村', ja: 'カントリー', ko: '컨트리', ar: 'كانتري', hi: 'कंट्री' },
  'folk': { en: 'Folk', es: 'Folk', pt: 'Folk', fr: 'Folk', de: 'Folk', it: 'Folk', ru: 'Фолк', zh: '民谣', ja: 'フォーク', ko: '포크', ar: 'فولك', hi: 'लोक' },
  'blues': { en: 'Blues', es: 'Blues', pt: 'Blues', fr: 'Blues', de: 'Blues', it: 'Blues', ru: 'Блюз', zh: '蓝调', ja: 'ブルース', ko: '블루스', ar: 'بلوز', hi: 'ब्लूज़' },
  'reggae': { en: 'Reggae', es: 'Reggae', pt: 'Reggae', fr: 'Reggae', de: 'Reggae', it: 'Reggae', ru: 'Регги', zh: '雷鬼', ja: 'レゲエ', ko: '레게', ar: 'ريغي', hi: 'रेगे' },
  'metal': { en: 'Metal', es: 'Metal', pt: 'Metal', fr: 'Métal', de: 'Metal', it: 'Metal', ru: 'Метал', zh: '金属', ja: 'メタル', ko: '메탈', ar: 'ميتال', hi: 'मेटल' },
  'punk': { en: 'Punk', es: 'Punk', pt: 'Punk', fr: 'Punk', de: 'Punk', it: 'Punk', ru: 'Панк', zh: '朋克', ja: 'パンク', ko: '펑크', ar: 'بانك', hi: 'पंक' },
  'soul': { en: 'Soul', es: 'Soul', pt: 'Soul', fr: 'Soul', de: 'Soul', it: 'Soul', ru: 'Соул', zh: '灵魂乐', ja: 'ソウル', ko: '소울', ar: 'سول', hi: 'सोल' },
  'latin': { en: 'Latin', es: 'Latina', pt: 'Latina', fr: 'Latine', de: 'Latin', it: 'Latina', ru: 'Латинская', zh: '拉丁', ja: 'ラテン', ko: '라틴', ar: 'لاتيني', hi: 'लैटिन' },
  'world': { en: 'World', es: 'Mundial', pt: 'Mundial', fr: 'Mondiale', de: 'Weltmusik', it: 'Mondiale', ru: 'Мировая', zh: '世界音乐', ja: 'ワールド', ko: '월드', ar: 'عالمي', hi: 'विश्व' },
  'ambient': { en: 'Ambient', es: 'Ambiental', pt: 'Ambiente', fr: 'Ambiant', de: 'Ambient', it: 'Ambient', ru: 'Эмбиент', zh: '氛围', ja: 'アンビエント', ko: '앰비언트', ar: 'أمبينت', hi: 'एम्बिएंट' },
  'chill': { en: 'Chill', es: 'Chill', pt: 'Chill', fr: 'Chill', de: 'Chill', it: 'Chill', ru: 'Чилл', zh: '放松', ja: 'チル', ko: '칠', ar: 'تشيل', hi: 'चिल' },
  'lounge': { en: 'Lounge', es: 'Lounge', pt: 'Lounge', fr: 'Lounge', de: 'Lounge', it: 'Lounge', ru: 'Лаунж', zh: '休闲', ja: 'ラウンジ', ko: '라운지', ar: 'لاونج', hi: 'लाउंज' },

  // Content types
  'news': { en: 'News', es: 'Noticias', pt: 'Notícias', fr: 'Actualités', de: 'Nachrichten', it: 'Notizie', ru: 'Новости', zh: '新闻', ja: 'ニュース', ko: '뉴스', ar: 'أخبار', hi: 'समाचार' },
  'talk': { en: 'Talk', es: 'Conversación', pt: 'Conversa', fr: 'Discussion', de: 'Talk', it: 'Talk', ru: 'Разговорное', zh: '谈话', ja: 'トーク', ko: '토크', ar: 'حوار', hi: 'वार्ता' },
  'sports': { en: 'Sports', es: 'Deportes', pt: 'Esportes', fr: 'Sports', de: 'Sport', it: 'Sport', ru: 'Спорт', zh: '体育', ja: 'スポーツ', ko: '스포츠', ar: 'رياضة', hi: 'खेल' },
  'comedy': { en: 'Comedy', es: 'Comedia', pt: 'Comédia', fr: 'Comédie', de: 'Comedy', it: 'Commedia', ru: 'Комедия', zh: '喜剧', ja: 'コメディ', ko: '코미디', ar: 'كوميديا', hi: 'कॉमेडी' },
  'education': { en: 'Education', es: 'Educación', pt: 'Educação', fr: 'Éducation', de: 'Bildung', it: 'Educazione', ru: 'Образование', zh: '教育', ja: '教育', ko: '교육', ar: 'تعليم', hi: 'शिक्षा' },
  'culture': { en: 'Culture', es: 'Cultura', pt: 'Cultura', fr: 'Culture', de: 'Kultur', it: 'Cultura', ru: 'Культура', zh: '文化', ja: '文化', ko: '문화', ar: 'ثقافة', hi: 'संस्कृति' },
  'religion': { en: 'Religion', es: 'Religión', pt: 'Religião', fr: 'Religion', de: 'Religion', it: 'Religione', ru: 'Религия', zh: '宗教', ja: '宗教', ko: '종교', ar: 'دين', hi: 'धर्म' },
  'christian': { en: 'Christian', es: 'Cristiana', pt: 'Cristã', fr: 'Chrétienne', de: 'Christlich', it: 'Cristiana', ru: 'Христианская', zh: '基督教', ja: 'キリスト教', ko: '기독교', ar: 'مسيحي', hi: 'ईसाई' },
  'gospel': { en: 'Gospel', es: 'Gospel', pt: 'Gospel', fr: 'Gospel', de: 'Gospel', it: 'Gospel', ru: 'Госпел', zh: '福音', ja: 'ゴスペル', ko: '가스펠', ar: 'جوسبل', hi: 'गॉस्पेल' },

  // Decades
  '60s': { en: '60s', es: 'Años 60', pt: 'Anos 60', fr: 'Années 60', de: '60er', it: 'Anni 60', ru: '60-е', zh: '60年代', ja: '60年代', ko: '60년대', ar: 'الستينات', hi: '60 के दशक' },
  '70s': { en: '70s', es: 'Años 70', pt: 'Anos 70', fr: 'Années 70', de: '70er', it: 'Anni 70', ru: '70-е', zh: '70年代', ja: '70年代', ko: '70년대', ar: 'السبعينات', hi: '70 के दशक' },
  '80s': { en: '80s', es: 'Años 80', pt: 'Anos 80', fr: 'Années 80', de: '80er', it: 'Anni 80', ru: '80-е', zh: '80年代', ja: '80年代', ko: '80년대', ar: 'الثمانينات', hi: '80 के दशक' },
  '90s': { en: '90s', es: 'Años 90', pt: 'Anos 90', fr: 'Années 90', de: '90er', it: 'Anni 90', ru: '90-е', zh: '90年代', ja: '90年代', ko: '90년대', ar: 'التسعينات', hi: '90 के दशक' },
  '00s': { en: '2000s', es: 'Años 2000', pt: 'Anos 2000', fr: 'Années 2000', de: '2000er', it: 'Anni 2000', ru: '2000-е', zh: '2000年代', ja: '2000年代', ko: '2000년대', ar: 'الألفية', hi: '2000 के दशक' },

  // Other common tags
  'music': { en: 'Music', es: 'Música', pt: 'Música', fr: 'Musique', de: 'Musik', it: 'Musica', ru: 'Музыка', zh: '音乐', ja: '音楽', ko: '음악', ar: 'موسيقى', hi: 'संगीत' },
  'hits': { en: 'Hits', es: 'Éxitos', pt: 'Sucessos', fr: 'Hits', de: 'Hits', it: 'Successi', ru: 'Хиты', zh: '热门', ja: 'ヒット', ko: '히트', ar: 'أغاني ناجحة', hi: 'हिट्स' },
  'top 40': { en: 'Top 40', es: 'Top 40', pt: 'Top 40', fr: 'Top 40', de: 'Top 40', it: 'Top 40', ru: 'Топ 40', zh: 'Top 40', ja: 'トップ40', ko: '탑 40', ar: 'أفضل 40', hi: 'टॉप 40' },
  'oldies': { en: 'Oldies', es: 'Oldies', pt: 'Clássicos', fr: 'Oldies', de: 'Oldies', it: 'Oldies', ru: 'Ретро', zh: '怀旧', ja: 'オールディーズ', ko: '올디스', ar: 'قديمة', hi: 'पुराने गाने' },
  'alternative': { en: 'Alternative', es: 'Alternativa', pt: 'Alternativa', fr: 'Alternative', de: 'Alternative', it: 'Alternativa', ru: 'Альтернатива', zh: '另类', ja: 'オルタナティブ', ko: '얼터너티브', ar: 'بديل', hi: 'वैकल्पिक' },
  'indie': { en: 'Indie', es: 'Indie', pt: 'Indie', fr: 'Indie', de: 'Indie', it: 'Indie', ru: 'Инди', zh: '独立', ja: 'インディー', ko: '인디', ar: 'إندي', hi: 'इंडी' },
  'local': { en: 'Local', es: 'Local', pt: 'Local', fr: 'Local', de: 'Lokal', it: 'Locale', ru: 'Местное', zh: '本地', ja: 'ローカル', ko: '로컬', ar: 'محلي', hi: 'स्थानीय' },
  'public': { en: 'Public', es: 'Pública', pt: 'Pública', fr: 'Publique', de: 'Öffentlich', it: 'Pubblica', ru: 'Публичное', zh: '公共', ja: '公共', ko: '공영', ar: 'عام', hi: 'सार्वजनिक' },
  'community': { en: 'Community', es: 'Comunitaria', pt: 'Comunitária', fr: 'Communautaire', de: 'Community', it: 'Comunitaria', ru: 'Общественное', zh: '社区', ja: 'コミュニティ', ko: '커뮤니티', ar: 'مجتمعي', hi: 'सामुदायिक' },
};

/**
 * Gets a localized genre/tag name.
 *
 * @param tag - The original tag from the API (usually in English)
 * @param locale - The target locale for translation
 * @returns The localized tag, or the original if no translation exists
 *
 * @example
 * getLocalizedTag('news', 'es'); // 'Noticias'
 * getLocalizedTag('rock', 'ja'); // 'ロック'
 * getLocalizedTag('unknown-tag', 'pt'); // 'unknown-tag' (pass-through)
 */
export function getLocalizedTag(tag: string, locale: Locale): string {
  const lower = tag.toLowerCase().trim();
  const translations = GENRE_TRANSLATIONS[lower];
  if (translations && translations[locale]) {
    return translations[locale];
  }
  // Capitalize first letter for unknown tags
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

/**
 * Localizes a comma-separated list of tags.
 *
 * @param tags - Comma-separated tags string from the API
 * @param locale - The target locale for translation
 * @returns Localized tags as a comma-separated string
 *
 * @example
 * getLocalizedTags('rock,pop,news', 'es'); // 'Rock, Pop, Noticias'
 */
export function getLocalizedTags(tags: string, locale: Locale): string {
  if (!tags) return '';
  return tags
    .split(',')
    .map(tag => getLocalizedTag(tag.trim(), locale))
    .join(', ');
}

import type { RawStation } from './extract.js';

// Common country name → ISO code mapping for gap-filling
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'US', 'usa': 'US', 'united states of america': 'US',
  'united kingdom': 'GB', 'uk': 'GB', 'great britain': 'GB',
  'germany': 'DE', 'deutschland': 'DE',
  'france': 'FR', 'spain': 'ES', 'italy': 'IT',
  'brazil': 'BR', 'brasil': 'BR',
  'canada': 'CA', 'australia': 'AU', 'japan': 'JP',
  'china': 'CN', 'india': 'IN', 'russia': 'RU',
  'mexico': 'MX', 'south korea': 'KR', 'netherlands': 'NL',
  'portugal': 'PT', 'argentina': 'AR', 'colombia': 'CO',
  'turkey': 'TR', 'poland': 'PL', 'sweden': 'SE',
  'switzerland': 'CH', 'austria': 'AT', 'belgium': 'BE',
  'norway': 'NO', 'denmark': 'DK', 'finland': 'FI',
  'ireland': 'IE', 'new zealand': 'NZ', 'chile': 'CL',
  'peru': 'PE', 'czech republic': 'CZ', 'czechia': 'CZ',
  'romania': 'RO', 'hungary': 'HU', 'greece': 'GR',
  'indonesia': 'ID', 'thailand': 'TH', 'philippines': 'PH',
  'vietnam': 'VN', 'ukraine': 'UA', 'egypt': 'EG',
  'south africa': 'ZA', 'nigeria': 'NG', 'kenya': 'KE',
  'israel': 'IL', 'saudi arabia': 'SA',
};

// URL extension → codec mapping
const EXT_TO_CODEC: Record<string, string> = {
  '.mp3': 'MP3',
  '.aac': 'AAC',
  '.ogg': 'OGG',
  '.flac': 'FLAC',
  '.wma': 'WMA',
  '.m3u': 'MP3',
  '.m3u8': 'AAC',
  '.pls': 'MP3',
};

// Non-English tag → English translation (lowercase)
const TAG_TRANSLATIONS: Record<string, string> = {
  // Spanish
  'entretenimiento': 'entertainment',
  'estación': 'station',
  'méxico': 'mexico',
  'norteamérica': 'north america',
  'español': 'spanish',
  'música': 'music',
  'música en español': 'spanish music',
  'latinoamérica': 'latin america',
  'noticias': 'news',
  'música pop': 'pop',
  'regional mexicana': 'regional mexican',
  'música popular mexicana': 'mexican popular music',
  'radio hablada': 'talk radio',
  'música regional': 'regional music',
  'música variada': 'variety',
  'juvenil': 'youth',
  'música en español e inglés': 'spanish and english music',
  'música del recuerdo': 'nostalgia',
  'pop en español e inglés': 'pop',
  'baladas en español': 'spanish ballads',
  'música regional mexicana': 'regional mexican music',
  'música y noticias': 'music and news',
  'música mexicana': 'mexican music',
  'ciudad de méxico': 'mexico city',
  'ciudad de mexico': 'mexico city',
  'ciudad mexico': 'mexico city',
  'noticias y comentarios': 'news and commentary',
  'música tradicional mexicana': 'traditional mexican music',
  'musica tradicional mexicana': 'traditional mexican music',
  'deportes': 'sports',
  'noticias en español': 'spanish news',
  'clásicos': 'classics',
  'clasicos': 'classics',
  'noticias locales': 'local news',
  'pop en inglés': 'english pop',
  'pop en español': 'spanish pop',
  'baladas': 'ballads',
  'cristiana': 'christian',
  'hablada': 'talk',
  'música urbana': 'urban music',
  'información': 'information',
  'informativa': 'information',
  'románticas': 'romantic',
  'romántica': 'romantic',
  'romantica': 'romantic',
  'radio pública': 'public radio',
  'pública': 'public',
  'pop clásico': 'classic pop',
  'clásicos en inglés': 'english classics',
  'clásicos en español': 'spanish classics',
  'balada en español': 'spanish ballad',
  'balada pop': 'pop ballad',
  'balada romántica': 'romantic ballad',
  'balada': 'ballad',
  'rock en español': 'spanish rock',
  'radio universitaria': 'university radio',
  'radio comunitaria': 'community radio',
  'musica romantica': 'romantic music',
  'música romántica': 'romantic music',
  'musica regional mexicana': 'regional mexican music',
  'musica regional': 'regional music',
  'musica mexicana': 'mexican music',
  'musica latina': 'latin',
  'música latina': 'latin',
  'musica latinoamericana': 'latin',
  'latin american music': 'latin',
  'musica italiana': 'italian',
  'musica': 'music',
  'amor': 'love',
  'evangelio': 'gospel',
  'urbano': 'urban',
  'pop latino': 'latin pop',
  'cultura': 'culture',
  'debates y deportes': 'debates and sports',
  'variado': 'variety',
  'variedad': 'variety',
  'noticias opinion': 'news and opinion',
  'noticias cortas': 'news briefs',
  'noticias nacionales e internacionales': 'national and international news',
  'noticias y deportes': 'news and sports',
  'entrevistas': 'interviews',
  'concesión social': 'social license',
  'folclore': 'folklore',
  'folclor': 'folklore',
  'cumbias': 'cumbia',
  'música tropical': 'tropical music',
  'rancheras': 'ranchera',
  'radio online': 'online radio',
  'latino américa': 'latin america',
  'latinoamerica': 'latin america',
  // German
  '80er': '80s',
  '90er': '90s',
  '70er': '70s',
  '60er': '60s',
  '2000er': '2000s',
  'schlager': 'schlager',
  'klassik': 'classical',
  'volksmusik': 'folk',
  'weihnachten': 'christmas',
  'nachrichten': 'news',
  'freies radio': 'free radio',
  // Russian
  'поп-музыка': 'pop',
  'ретро': 'retro',
  'танцевальная': 'dance',
  'рок': 'rock',
  'лёгкая музыка': 'easy listening',
  'лëгкая музыка': 'easy listening',
  // French
  'chansons françaises': 'french chanson',
  'radio communautaire': 'community radio',
  // Romanian
  'petrecere': 'party',
  // Spanish (additional)
  'música en inglés': 'english music',
  'américa': 'america',
  'valle de méxico': 'valley of mexico',
  'norteña': 'norteña',
  'amor sólo música romántica': 'romantic music',
  'sólo música romántica': 'romantic music',
  '80s en español': 'spanish 80s',
  '90s y más': '90s',
  // Decade normalization
  "80's": '80s', '1980s': '80s', "1980's": '80s',
  "90's": '90s', '1990s': '90s', '90s and more': '90s',
  "70's": '70s', '1970s': '70s', '70 80 hits': 'oldies',
  "60's": '60s', '1960s': '60s',
  '1950s': '50s',
  "00's": '00s',
  // Genre dedup
  'pop music': 'pop',
  'folk music': 'folk',
  'dance music': 'dance',
  'country music': 'country',
  'classical music': 'classical',
  'christian music': 'christian',
  'latin music': 'latin',
  'lounge music': 'lounge',
  'tropical music': 'tropical',
  'electronic music': 'electronic',
  'electronic dance music': 'edm',
  'african music': 'african',
  'world music': 'world',
  'brazilian music': 'brazilian',
  'australian music': 'australian',
  'italian music': 'italian',
  'greek music': 'greek',
  'greek folk music': 'greek folk',
  'russian hits': 'russian',
  'hip-hop': 'hip hop',
  'hiphop': 'hip hop',
  'rap hiphop rnb': 'hip hop',
  'rnb': 'r&b',
  'r&b/urban': 'r&b',
  'top40': 'top 40',
  'top 40 hits': 'top 40',
  'top100': 'top 40',
  'top hits': 'top 40',
  'top charts': 'top 40',
  'chillout+lounge': 'chillout',
  'chill': 'chillout',
  'drum & bass': 'drum and bass',
  'dnb': 'drum and bass',
  'alternative / indie': 'alternative',
  'pop-rock': 'pop rock',
  'rock n roll': 'rock and roll',
  'rock classics': 'classic rock',
  'smooth lounge': 'lounge',
  'various music': 'variety',
  'variety hits': 'variety',
  'soft music': 'soft',
  'retro hits': 'retro',
  'golden oldies': 'oldies',
  'goldies': 'oldies',
  "oldies 50's/60's": 'oldies',
  'relaxation': 'relax',
  'relaxing': 'relax',
  'ambient and relaxation music': 'ambient',
  'rhythm and blues': 'r&b',
  'contemporary hits': 'contemporary hit radio',
  'contemporary hits radio': 'contemporary hit radio',
  'spanish contemporary hits': 'contemporary hit radio',
  'talk & speech': 'talk',
  'talk show': 'talk',
  'talk radio': 'talk',
  'news talk': 'news',
  'news talk music': 'news',
  'news and commentary': 'news',
  'news and opinion': 'news',
  'news and sports': 'news',
  'news briefs': 'news',
  'national and international news': 'news',
  'spanish news': 'news',
  'local news': 'news',
  'world news': 'news',
  'sports news': 'sports',
  'live sports': 'sports',
  'sports talk': 'sports',
  'debates and sports': 'sports',
  'romantic music': 'romantic',
  'romantic ballad': 'romantic',
  'love songs': 'love',
  'lovesongs': 'love',
  'christian contemporary': 'christian',
  'christian-gospel': 'gospel',
  'christian praise&worship': 'worship',
  'orthodox christian': 'orthodox',
  'classic pop': 'pop',
  'club dance': 'club',
  'club house': 'club',
  'dance pop': 'pop',
  'pop dance': 'pop',
  'dj remix': 'dj',
  'dj sets': 'dj',
  'dj mixes': 'dj',
  'dj mix': 'dj',
  'internet radio': 'radio',
  'online radio': 'radio',
  'classic jazz': 'jazz',
  'vocal jazz': 'jazz',
  'smooth jazz': 'jazz',
  'jazz fusion': 'jazz',
  'electro house': 'electro',
  'funky house': 'funky',
  'classic country': 'country',
  'new country': 'country',
  'j-pop': 'jpop',
  'k-pop': 'kpop',
  'soft pop': 'soft rock',
  'grupero': 'grupera',
  'norteño': 'norteña',
  'banda norteña': 'banda',
  'banda tradicional': 'banda',
  'sport': 'sports',
  'religion': 'religious',
  'orthodox': 'orthodoxy',
  'ballad': 'ballads',
  'remix': 'remixes',
  'soundtrack': 'soundtracks',
  'movie': 'film',
  'urban contemporary': 'urban',
  'urban adult contemporary': 'urban',
  'hot ac': 'hot adult contemporary',
  'soft adult contemporary': 'adult contemporary',
  'adult album alternative': 'alternative',
  'active rock': 'rock',
  'mainstream rock': 'rock',
  'modern rock': 'rock',
  'album rock': 'rock',
  'art rock': 'progressive rock',
  '70s disco': 'disco',
  'disco funk': 'disco',
  'disco polo': 'disco',
  'italo disco': 'disco',
  'nu disco': 'disco',
  'discofox': 'disco',
  'clubbing': 'club',
  'party hits': 'party',
  'conservative talk': 'talk',
  'political talk': 'talk',
  '10s': '2010s',
  '20s': '2020s',
};

// Tags that are radio network/brand names — not genres, should be dropped
const TAG_BLACKLIST = new Set([
  'moi merino', 'radio', 'fm', 'am', 'station', 'mex', 'mx',
  'mvs radio', 'mvs', 'exa fm', 'exa', 'ponte exa',
  'la estación naranja', 'la estación exacta',
  'grupo acir', 'acir', 'acir online',
  'grupo audiorama comunicaciones', 'grupo radio centro',
  'grupo radio cañón', 'grupo radiofónico zer', 'grupo fórmula',
  'multimedios radio', 'ntr medios de comunicación',
  'radio caprice', 'radcap', 'radiorama', 'radiópolis',
  'iheart', 'iheart radio', 'los40', 'la mejor', 'la mejor fm',
  'la mejor aquí nomás', 'aquí nomás', 'la ke buena',
  'w radio', 'mediaset', 'apm', 'pri', 'combo',
  'online', 'online only', 'internet', 'https', 'mp3', 'aac', 'm3u8',
  'exclusive', 'free', 'live', 'livestream', '24/7',
  'no ads', 'non-stop music', 'commercial-free',
  'features', 'misc', 'miscellaneous', 'various', 'other', 'general',
  'mix fm', 'mix', 'estación', 'north america',
  'geheimezender', 'piraten', 'piratenhits',
  'discography', 'waynesboro', '64kbps',
  'abc', 'ard', 'ert', 'orf', 'vrt', 'bbc',
  'srg ssr', 'r.sa', 'sveriges radio', 'radio france',
  'the best of 80\'s', 'en todas partes',
  // Location names (not genres)
  'jalisco', 'veracruz', 'sinaloa', 'sonora', 'nuevo león', 'guanajuato',
  'baja california', 'sureste', 'monterrey', 'guadalajara', 'coahuila',
  'puebla', 'estado de méxico', 'michoacán', 'guerrero', 'aguascalientes',
  'nayarit', 'zacatecas', 'tamaulipas', 'mexicali', 'culiacán', 'león',
  'cdmx', 'gdl', 'california', 'texas', 'chicago', 'new york city',
  'toronto', 'nizhniy novgorod', 'waynesboro',
  // More brands/networks
  'radio fórmula', 'moi merino',
  // Meta/technical tags
  'station', 'north america', 'america', 'valley of mexico',
  'español', 'méxico', 'música', 'mex',
  // Bare numbers (not useful tags)
  '80', '90',
  // Locations
  'mexico', 'mexico city', 'chihuahua', 'usa', 'argentina',
  'norteamérica', 'latinoamérica', 'latin america',
  'german', 'russian', 'spanish', 'dutch', 'italian', 'greek',
  'hindi', 'tamil', 'arabic',
  // Noise/meta
  'top', 'music', 'hits', 'radio', 'local', 'public', 'popular',
  'classic', 'contemporary', 'various music', 'mixed',
  'mainstream', 'commercial', 'independent', 'non-commercial',
  'non-profit', 'social', 'social license', 'full service',
  'paradise', 'modern', 'international', 'national', 'regional',
  'local music', 'local radio', 'local talk', 'local information',
  'local programming', 'regional radio',
  'community', 'campus radio', 'college radio', 'student radio',
  'university radio', 'university', 'college', 'educational',
  'public radio', 'public service', 'community radio',
  'traffic', 'traffic radio broadcast', 'traffic information',
  'weather', 'government', 'economics',
  'american forces network',
  // Additional locations
  'villahermosa', 'tabasco', 'oaxaca', 'durango', 'tlaxcala',
  'quintana roo', 'campeche', 'hidalgo', 'morelos', 'colima',
  'san luis potosí', 'san luis potosi', 'yucatán', 'yucatan',
  'queretaro', 'querétaro', 'chiapas',
  // Additional brands/networks
  'grupo zer', 'grupo radiofonicos zer', 'grupo radiofónico zer',
  'cadena ser', 'cope', 'rne', 'rtve', 'caracol',
  // Compound garbage tags
  'club dance electronic house trance',
  // More noise/meta
  'best', 'greatest', 'favorites', 'favourites', 'selection',
  'collection', 'playlist', 'non stop', 'nonstop',
  'the best', 'all genres', 'all music', 'multi-genre', 'multigenre',
  'spanish and english music', 'english music', 'spanish music',
  'mexican popular music', 'traditional mexican music',
  'regional mexican music', 'regional music', 'regional mexican',
  'mexican music', 'variety', 'entertainment',
  'information', 'interviews', 'youth', 'culture',
  'love', 'romantic', 'spanish ballads', 'spanish ballad',
  'pop ballad', 'spanish pop', 'english pop', 'spanish 80s',
  'spanish rock', 'spanish classics', 'english classics',
  'music and news',
  // More locations still leaking
  'mexico', 'latin america', 'spanish', 'mexico city',
  // More meta/noise
  'music', 'entertainment', 'urban music', 'soft',
  'classics', 'charts', 'decades', 'greatest hits', 'party hits',
  'flashback', 'evergreens', 'adult', 'black',
  'spanish adult hits', 'cultural news', 'new music',
  'multicultural', 'multilingual',
]);

export interface SkippedStation {
  name: string;
  stationuuid: string;
  url_resolved: string;
  reason: string;
}

export interface TransformResult {
  stations: TransformedStation[];
  skipped: number;
  skippedDetails: SkippedStation[];
}

export interface TransformedStation {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
  clickcount: number;
  clicktrend: number;
  geo_lat: number | null;
  geo_long: number | null;
  has_extended_info: number;
  lastchangetime_iso8601: string;
  lastcheckok: number;
  is_broken: number;
}

export function transformStations(raw: RawStation[]): TransformResult {
  let skipped = 0;
  const skippedDetails: SkippedStation[] = [];

  // Step 1: Drop stations missing name or url_resolved
  const valid = raw.filter(s => {
    const missingName = !s.name?.trim();
    const missingUrl = !s.url_resolved?.trim();
    if (missingName || missingUrl) {
      skipped++;
      const reasons: string[] = [];
      if (missingName) reasons.push('missing name');
      if (missingUrl) reasons.push('missing url_resolved');
      skippedDetails.push({
        name: s.name || '(empty)',
        stationuuid: s.stationuuid || '',
        url_resolved: s.url_resolved || '',
        reason: reasons.join(', '),
      });
      return false;
    }
    return true;
  });

  // Step 2: Deduplicate by url_resolved — keep entry with highest clickcount
  const byUrl = new Map<string, RawStation>();
  for (const s of valid) {
    const key = s.url_resolved.trim().toLowerCase();
    const existing = byUrl.get(key);
    if (!existing || s.clickcount > existing.clickcount) {
      if (existing) {
        // The previously stored one is now the duplicate
        skipped++;
        skippedDetails.push({
          name: existing.name,
          stationuuid: existing.stationuuid,
          url_resolved: existing.url_resolved,
          reason: `duplicate url_resolved (clickcount ${existing.clickcount} < ${s.clickcount})`,
        });
      }
      byUrl.set(key, s);
    } else {
      skipped++;
      skippedDetails.push({
        name: s.name,
        stationuuid: s.stationuuid,
        url_resolved: s.url_resolved,
        reason: `duplicate url_resolved (clickcount ${s.clickcount} <= ${existing.clickcount})`,
      });
    }
  }

  // Step 3: Normalize and transform
  const stations: TransformedStation[] = [];

  for (const s of byUrl.values()) {
    // Normalize tags: trim, lowercase, translate, filter blacklist, deduplicate
    const tagList = s.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
      .map(t => TAG_TRANSLATIONS[t] || t)
      .map(t => TAG_TRANSLATIONS[t] || t) // second pass for chained translations
      .filter(t => !TAG_BLACKLIST.has(t));
    const uniqueTags = [...new Set(tagList)].join(',');

    // Normalize countrycode: uppercase
    let countrycode = (s.countrycode || '').trim().toUpperCase();

    // Fill gap: infer countrycode from country name
    if (!countrycode && s.country) {
      const normalized = s.country.trim().toLowerCase();
      countrycode = COUNTRY_NAME_TO_CODE[normalized] || '';
    }

    // Fill gap: infer codec from URL extension
    let codec = (s.codec || '').trim();
    if (!codec && s.url_resolved) {
      try {
        const urlPath = new URL(s.url_resolved).pathname.toLowerCase();
        for (const [ext, c] of Object.entries(EXT_TO_CODEC)) {
          if (urlPath.endsWith(ext)) {
            codec = c;
            break;
          }
        }
      } catch {
        // Invalid URL, skip codec inference
      }
    }

    stations.push({
      changeuuid: (s.changeuuid || '').trim(),
      stationuuid: (s.stationuuid || '').trim(),
      name: s.name.trim(),
      url: (s.url || '').trim(),
      url_resolved: s.url_resolved.trim(),
      homepage: (s.homepage || '').trim(),
      favicon: (s.favicon || '').trim(),
      tags: uniqueTags,
      country: (s.country || '').trim(),
      countrycode,
      state: (s.state || '').trim(),
      language: (s.language || '').trim(),
      codec,
      bitrate: s.bitrate || 0,
      votes: s.votes || 0,
      clickcount: s.clickcount || 0,
      clicktrend: s.clicktrend || 0,
      geo_lat: s.geo_lat ?? null,
      geo_long: s.geo_long ?? null,
      has_extended_info: s.has_extended_info ? 1 : 0,
      lastchangetime_iso8601: (s.lastchangetime_iso8601 || '').trim(),
      lastcheckok: s.lastcheckok ?? 1,
      is_broken: s.lastcheckok === 0 ? 1 : 0,
    });
  }

  console.log(`Transform: ${stations.length} stations kept, ${skipped} skipped`);
  return { stations, skipped, skippedDetails };
}

import { getDb } from '../db/connection.js';
import { config } from '../config.js';

// --- Types ---

interface DigStationResult {
  name: string;
  uuid: string;
  status: 'done' | 'partial' | 'failed';
  fieldsFilled: string[];
  valuesFound: Record<string, string>;
  error: string | null;
  duration: number; // ms
  timestamp: string;
}

interface DigJobState {
  status: 'idle' | 'running' | 'paused' | 'cancelled';
  processed: number;
  total: number;
  filled: Record<string, number>;
  errors: number;
  currentStation: string;
  results: DigStationResult[];
}

interface AddressInfo {
  text: string;
  source: string; // e.g. 'JSON-LD', 'microdata', '<address> tag', 'contact page', 'footer pattern'
}

interface HomepageData {
  title: string;
  description: string;
  keywords: string[];
  language: string;
  faviconUrl: string;
  ogImage: string;
  addresses: AddressInfo[];
  contactLinks: string[];
  jsonLd: Record<string, unknown> | null;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface Station {
  id: number;
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
  geo_lat: number | null;
  geo_long: number | null;
  clickcount: number;
}

// --- State ---

const jobState: DigJobState = {
  status: 'idle',
  processed: 0,
  total: 0,
  filled: {},
  errors: 0,
  currentStation: '',
  results: [],
};

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// TLD → country code mapping (common ones)
const TLD_COUNTRY: Record<string, string> = {
  '.br': 'BR', '.de': 'DE', '.fr': 'FR', '.uk': 'GB', '.it': 'IT',
  '.es': 'ES', '.pt': 'PT', '.nl': 'NL', '.be': 'BE', '.at': 'AT',
  '.ch': 'CH', '.pl': 'PL', '.cz': 'CZ', '.se': 'SE', '.no': 'NO',
  '.dk': 'DK', '.fi': 'FI', '.ru': 'RU', '.jp': 'JP', '.kr': 'KR',
  '.cn': 'CN', '.in': 'IN', '.au': 'AU', '.nz': 'NZ', '.ca': 'CA',
  '.mx': 'MX', '.ar': 'AR', '.cl': 'CL', '.co': 'CO', '.za': 'ZA',
  '.gr': 'GR', '.tr': 'TR', '.ie': 'IE', '.hu': 'HU', '.ro': 'RO',
  '.bg': 'BG', '.hr': 'HR', '.sk': 'SK', '.si': 'SI', '.rs': 'RS',
  '.ua': 'UA', '.il': 'IL', '.ae': 'AE', '.sa': 'SA', '.eg': 'EG',
  '.ng': 'NG', '.ke': 'KE', '.gh': 'GH', '.pe': 'PE', '.ec': 'EC',
  '.uy': 'UY', '.ve': 'VE', '.bo': 'BO', '.py': 'PY', '.cr': 'CR',
  '.pa': 'PA', '.do': 'DO', '.gt': 'GT', '.hn': 'HN', '.sv': 'SV',
  '.ni': 'NI', '.cu': 'CU', '.ph': 'PH', '.th': 'TH', '.vn': 'VN',
  '.id': 'ID', '.my': 'MY', '.sg': 'SG', '.tw': 'TW', '.hk': 'HK',
  '.pk': 'PK', '.bd': 'BD', '.lk': 'LK', '.np': 'NP',
};

// Social / aggregator domains to skip when picking homepage
const SKIP_DOMAINS = new Set([
  'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'youtube.com',
  'tiktok.com', 'linkedin.com', 'wikipedia.org', 'reddit.com',
  'radio-browser.info', 'tunein.com', 'radio.net', 'streema.com',
  'onlineradiobox.com', 'radio.garden', 'mytuner-radio.com',
  'internet-radio.com', 'radios.com.br', 'rfrn.ru',
]);

// Content-Type → codec mapping
const CONTENT_TYPE_CODEC: Record<string, string> = {
  'audio/mpeg': 'MP3',
  'audio/mp3': 'MP3',
  'audio/aac': 'AAC',
  'audio/aacp': 'AAC+',
  'audio/ogg': 'OGG',
  'audio/flac': 'FLAC',
  'audio/x-flac': 'FLAC',
  'application/ogg': 'OGG',
};

// --- Helpers ---

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function incrementFilled(field: string) {
  jobState.filled[field] = (jobState.filled[field] || 0) + 1;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function isDomainSkipped(url: string): boolean {
  const domain = extractDomain(url).toLowerCase();
  for (const skip of SKIP_DOMAINS) {
    if (domain === skip || domain.endsWith('.' + skip)) return true;
  }
  return false;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.dig.fetchTimeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// --- Core Functions ---

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': BROWSER_UA },
      redirect: 'follow',
    });
    const html = await res.text();
    const results: SearchResult[] = [];

    // Parse results from DDG HTML
    const resultBlocks = html.split('class="result__body"');
    for (let i = 1; i < resultBlocks.length && results.length < 5; i++) {
      const block = resultBlocks[i];

      // Extract URL from result__url or result__a href
      const hrefMatch = block.match(/href="([^"]+)"[^>]*class="result__a"/);
      const urlMatch = block.match(/class="result__url"[^>]*>([^<]+)</);
      let resultUrl = '';
      if (hrefMatch) {
        // DDG wraps URLs - extract the actual URL from uddg parameter
        const uddgMatch = hrefMatch[1].match(/uddg=([^&]+)/);
        resultUrl = uddgMatch ? decodeURIComponent(uddgMatch[1]) : hrefMatch[1];
      } else if (urlMatch) {
        resultUrl = urlMatch[1].trim();
        if (!resultUrl.startsWith('http')) resultUrl = 'https://' + resultUrl;
      }

      const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      if (resultUrl) {
        results.push({
          title: titleMatch ? titleMatch[1].trim() : '',
          url: resultUrl,
          snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function extractAddressesFromHtml(html: string, baseUrl: string): { addresses: AddressInfo[]; contactLinks: string[] } {
  const addresses: AddressInfo[] = [];
  const contactLinks: string[] = [];
  const seenAddresses = new Set<string>();

  function addAddress(text: string, source: string) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length > 10 && clean.length < 300 && !seenAddresses.has(clean)) {
      seenAddresses.add(clean);
      addresses.push({ text: clean, source });
    }
  }

  // 1. JSON-LD (all script blocks, may have multiple)
  const jsonLdBlocks = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(m[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        // Direct address
        const addr = item.address || item.location?.address;
        if (addr) {
          if (typeof addr === 'string') {
            addAddress(addr, 'JSON-LD');
          } else if (addr.streetAddress || addr.addressLocality) {
            const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode, addr.addressCountry].filter(Boolean);
            addAddress(parts.join(', '), 'JSON-LD');
          }
        }
        // geo coordinates directly in JSON-LD
        if (item.geo?.latitude && item.geo?.longitude) {
          addAddress(`${item.geo.latitude}, ${item.geo.longitude}`, 'JSON-LD geo');
        }
      }
    } catch { /* skip invalid */ }
  }

  // 2. Microdata: itemprop="address" or itemtype PostalAddress
  const microdataPatterns = [
    /itemprop=["'](?:address|streetAddress|location)["'][^>]*>([^<]+)</gi,
    /itemtype=["'][^"']*PostalAddress["'][^>]*>([\s\S]*?)<\/[^>]+>/gi,
  ];
  for (const pat of microdataPatterns) {
    for (const m of html.matchAll(pat)) {
      const text = stripHtml(m[1]);
      if (text) addAddress(text, 'microdata');
    }
  }

  // 3. <address> HTML tag
  for (const m of html.matchAll(/<address[^>]*>([\s\S]*?)<\/address>/gi)) {
    const text = stripHtml(m[1]);
    if (text) addAddress(text, '<address> tag');
  }

  // 4. vCard / hCard classes
  for (const m of html.matchAll(/class=["'][^"']*(?:adr|street-address|vcard)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p|li|section)>/gi)) {
    const text = stripHtml(m[1]);
    if (text) addAddress(text, 'vCard/hCard');
  }

  // 5. Footer section — often contains address
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  if (footerMatch) {
    const footerText = stripHtml(footerMatch[1]);
    // Look for address-like patterns in footer
    const addrPatterns = [
      // Street number + name + city (multiple languages)
      /\d{1,5}\s+[\w\s.'-]{3,40},\s*[\w\s.'-]{2,30},?\s*[\w\s.'-]{2,30}(?:\s+\d{4,6})?/i,
      // Rua/Av./Calle patterns (PT/ES/FR)
      /(?:rua|avenida|av\.|alameda|travessa|calle|rue|boulevard|blvd|via|viale|straße|strasse|str\.)\s+[\w\s.'-]{3,50},?\s*(?:n[°º.]?\s*)?\d{0,6},?\s*[\w\s.'-]{2,40}/i,
      // Postal code patterns (various countries)
      /[\w\s.'-]{5,40},?\s*\d{4,6}[-\s]?\d{0,4}\s*[\w\s.'-]{2,30}/i,
      // "Address:" or "Location:" label
      /(?:address|endereço|dirección|adresse|indirizzo|adres|адрес)[:\s]+([^\n|<]{10,100})/i,
    ];
    for (const pat of addrPatterns) {
      const addrMatch = footerText.match(pat);
      if (addrMatch) {
        addAddress(addrMatch[0], 'footer pattern');
      }
    }
  }

  // 6. General page body — look for labeled addresses
  const labelPatterns = [
    /(?:our\s+)?(?:address|location|sede|endereço|dirección|adresse|indirizzo|adres|anschrift|locatie)[:\s]*<[^>]*>\s*([\s\S]{10,200}?)<\/(?:p|div|span|li|td)/gi,
    /(?:address|endereço|dirección|adresse|indirizzo|anschrift)[:\s]+([^<\n]{10,150})/gi,
  ];
  for (const pat of labelPatterns) {
    for (const m of html.matchAll(pat)) {
      const text = stripHtml(m[1] || m[0]);
      if (text.length > 10 && text.length < 200) addAddress(text, 'labeled address');
    }
  }

  // 7. Collect contact page links
  const contactHrefPattern = /href=["']([^"']*(?:contact|contato|contacto|kontakt|about|sobre|impressum|qui-sommes|chi-siamo|uber-uns)[^"']*)["']/gi;
  for (const m of html.matchAll(contactHrefPattern)) {
    let href = m[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        href = `${base.protocol}//${base.host}${href}`;
      } catch { continue; }
    } else if (!href.startsWith('http')) {
      try { href = new URL(href, baseUrl).href; } catch { continue; }
    }
    if (!contactLinks.includes(href)) contactLinks.push(href);
  }

  return { addresses, contactLinks: contactLinks.slice(0, 4) };
}

async function scrapePageHtml(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': BROWSER_UA },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function scrapeHomepage(url: string): Promise<HomepageData | null> {
  const html = await scrapePageHtml(url);
  if (!html) return null;

  const data: HomepageData = {
    title: '', description: '', keywords: [], language: '',
    faviconUrl: '', ogImage: '', addresses: [], contactLinks: [], jsonLd: null,
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) data.title = titleMatch[1].trim();

  // HTML lang
  const langMatch = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  if (langMatch) data.language = langMatch[1].trim().split('-')[0].toLowerCase();

  // Meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  if (descMatch) data.description = descMatch[1].trim();

  // Meta keywords
  const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']keywords["']/i);
  if (kwMatch) data.keywords = kwMatch[1].split(',').map(k => k.trim().toLowerCase()).filter(Boolean);

  // Content-Language meta
  if (!data.language) {
    const clMatch = html.match(/<meta[^>]*http-equiv=["']content-language["'][^>]*content=["']([^"']+)["']/i);
    if (clMatch) data.language = clMatch[1].trim().split('-')[0].toLowerCase();
  }

  // Favicon
  const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i);
  if (iconMatch) {
    let iconUrl = iconMatch[1];
    if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
    else if (iconUrl.startsWith('/')) {
      const base = new URL(url);
      iconUrl = `${base.protocol}//${base.host}${iconUrl}`;
    } else if (!iconUrl.startsWith('http')) {
      iconUrl = new URL(iconUrl, url).href;
    }
    data.faviconUrl = iconUrl;
  }

  // OG image
  const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogMatch) data.ogImage = ogMatch[1];

  // JSON-LD — store first valid one
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try { data.jsonLd = JSON.parse(jsonLdMatch[1]); } catch { /* skip */ }
  }

  // Extract addresses and contact links
  const extracted = extractAddressesFromHtml(html, url);
  data.addresses = extracted.addresses;
  data.contactLinks = extracted.contactLinks;

  return data;
}

async function findHomepage(station: Station): Promise<string | null> {
  // If homepage exists, validate it
  if (station.homepage) {
    try {
      const res = await fetchWithTimeout(station.homepage, {
        method: 'HEAD',
        headers: { 'User-Agent': BROWSER_UA },
        redirect: 'follow',
      });
      if (res.ok) return station.homepage;
    } catch { /* invalid homepage */ }
  }

  // Search DuckDuckGo
  const query = `"${station.name}" radio${station.country ? ' ' + station.country : ''}`;
  const results = await searchDuckDuckGo(query);
  await sleep(config.dig.searchDelay);

  for (const result of results) {
    if (!isDomainSkipped(result.url)) {
      try {
        const res = await fetchWithTimeout(result.url, {
          method: 'HEAD',
          headers: { 'User-Agent': BROWSER_UA },
          redirect: 'follow',
        });
        if (res.ok) return result.url;
      } catch { continue; }
    }
  }

  return null;
}

async function findFavicon(homepage: string, homepageData: HomepageData | null): Promise<{ url: string; method: string } | null> {
  // From homepage scrape
  if (homepageData?.faviconUrl) {
    try {
      const res = await fetchWithTimeout(homepageData.faviconUrl, { method: 'HEAD', redirect: 'follow' });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && (ct.includes('image') || ct.includes('icon'))) return { url: homepageData.faviconUrl, method: 'HTML <link> tag' };
    } catch { /* skip */ }
  }

  // Try /favicon.ico
  try {
    const domain = new URL(homepage).origin;
    const icoUrl = `${domain}/favicon.ico`;
    const res = await fetchWithTimeout(icoUrl, { method: 'HEAD', redirect: 'follow' });
    if (res.ok) return { url: icoUrl, method: '/favicon.ico' };
  } catch { /* skip */ }

  // Fallback: Google S2
  const domain = extractDomain(homepage);
  if (domain) {
    const s2Url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    try {
      const res = await fetchWithTimeout(s2Url, { method: 'HEAD', redirect: 'follow' });
      if (res.ok) return { url: s2Url, method: 'Google S2' };
    } catch { /* skip */ }
  }

  return null;
}

async function inferCountry(station: Station): Promise<{ country: string; countrycode: string } | null> {
  // From stream IP via ip-api.com
  if (station.url_resolved) {
    try {
      const hostname = new URL(station.url_resolved).hostname;
      const res = await fetchWithTimeout(`http://ip-api.com/json/${hostname}?fields=status,country,countryCode`, {
        headers: { 'User-Agent': 'AstroTune/1.0' },
      });
      if (res.ok) {
        const data = await res.json() as { status: string; country: string; countryCode: string };
        if (data.status === 'success' && data.countryCode) {
          return { country: data.country, countrycode: data.countryCode };
        }
      }
    } catch { /* skip */ }
  }

  // From homepage TLD
  const url = station.homepage || station.url_resolved;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      const lastDot = hostname.lastIndexOf('.');
      const tld = hostname.substring(lastDot).toLowerCase();
      if (TLD_COUNTRY[tld]) {
        return { country: '', countrycode: TLD_COUNTRY[tld] };
      }
    } catch { /* skip */ }
  }

  return null;
}

async function geocodeAddress(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'AstroTune/1.0 (radio station database)' },
    });
    await sleep(config.dig.nominatimDelay);
    if (res.ok) {
      const results = await res.json() as { lat: string; lon: string }[];
      if (results.length > 0) {
        return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
      }
    }
  } catch { /* skip */ }
  return null;
}

async function inferGeoLocation(
  station: Station,
  homepageData: HomepageData | null,
): Promise<{ lat: number; lon: number; method: string; query: string } | null> {
  // Build a priority list of address queries to try (most specific first)
  const candidates: { query: string; method: string }[] = [];

  // 1. Addresses extracted from homepage (JSON-LD, microdata, <address> tags, footer, etc.)
  if (homepageData?.addresses) {
    for (const addr of homepageData.addresses) {
      // Check if it's a direct lat/lon from JSON-LD geo
      if (addr.source === 'JSON-LD geo') {
        const parts = addr.text.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return { lat: parts[0], lon: parts[1], method: 'JSON-LD geo coordinates', query: addr.text };
        }
      }
      candidates.push({ query: addr.text, method: `homepage: ${addr.source}` });
    }
  }

  // 2. Scrape contact/about pages for street addresses
  if (homepageData?.contactLinks && homepageData.contactLinks.length > 0 && candidates.length === 0) {
    for (const contactUrl of homepageData.contactLinks.slice(0, 2)) {
      const contactHtml = await scrapePageHtml(contactUrl);
      if (contactHtml) {
        const { addresses } = extractAddressesFromHtml(contactHtml, contactUrl);
        for (const addr of addresses) {
          candidates.push({ query: addr.text, method: `contact page (${addr.source})` });
        }
        if (addresses.length > 0) break; // found addresses, stop fetching more pages
      }
    }
  }

  // 3. Fallbacks: station metadata
  if (station.state && station.country) {
    candidates.push({ query: `${station.state}, ${station.country}`, method: 'state + country' });
  }
  if (station.country) {
    candidates.push({ query: station.country, method: 'country name' });
  }

  // Try each candidate in order — first successful geocode wins
  for (const candidate of candidates) {
    const result = await geocodeAddress(candidate.query);
    if (result) {
      return { ...result, method: candidate.method, query: candidate.query };
    }
  }

  return null;
}

function inferLanguage(homepageData: HomepageData | null): string | null {
  if (homepageData?.language) return homepageData.language;
  return null;
}

function inferTags(station: Station, homepageData: HomepageData | null): string | null {
  const tagSet = new Set<string>();

  // From meta keywords
  if (homepageData?.keywords) {
    for (const kw of homepageData.keywords) {
      if (kw.length > 2 && kw.length < 30) tagSet.add(kw);
    }
  }

  // From station name patterns
  const nameLC = station.name.toLowerCase();
  const genres = [
    'jazz', 'rock', 'pop', 'classical', 'blues', 'country', 'metal', 'punk',
    'hip hop', 'rap', 'r&b', 'soul', 'funk', 'reggae', 'electronic', 'techno',
    'house', 'trance', 'ambient', 'chill', 'lounge', 'folk', 'indie',
    'alternative', 'latin', 'salsa', 'cumbia', 'bachata', 'merengue',
    'sertanejo', 'forró', 'mpb', 'samba', 'bossa nova', 'pagode',
    'gospel', 'christian', 'worship', 'news', 'talk', 'sports', 'oldies',
    'retro', '80s', '90s', '70s', '60s', 'disco', 'dance',
  ];
  for (const g of genres) {
    if (nameLC.includes(g)) tagSet.add(g);
  }

  // From description
  if (homepageData?.description) {
    const descLC = homepageData.description.toLowerCase();
    for (const g of genres) {
      if (descLC.includes(g)) tagSet.add(g);
    }
  }

  if (tagSet.size === 0) return null;
  return [...tagSet].slice(0, 10).join(',');
}

async function inferCodecBitrate(urlResolved: string): Promise<{ codec: string; bitrate: number } | null> {
  if (!urlResolved) return null;

  try {
    const res = await fetchWithTimeout(urlResolved, {
      method: 'GET',
      headers: {
        'User-Agent': BROWSER_UA,
        'Icy-MetaData': '1',
        'Range': 'bytes=0-0',
      },
      redirect: 'follow',
    });

    const ct = (res.headers.get('content-type') || '').toLowerCase().split(';')[0].trim();
    const icyBr = res.headers.get('icy-br');

    // Abort body immediately
    try { res.body?.cancel(); } catch { /* ok */ }

    const codec = CONTENT_TYPE_CODEC[ct] || '';
    const bitrate = icyBr ? parseInt(icyBr, 10) : 0;

    if (codec || bitrate) {
      return { codec, bitrate: isNaN(bitrate) ? 0 : bitrate };
    }
  } catch { /* skip */ }

  return null;
}

async function autocompleteStation(station: Station): Promise<{ fieldsUpdated: string[]; valuesFound: Record<string, string> }> {
  const fieldsUpdated: string[] = [];
  const updates: Record<string, unknown> = {};
  const valuesFound: Record<string, string> = {};

  // 1. Find/validate homepage
  let homepage = station.homepage;
  if (!homepage) {
    const found = await findHomepage(station);
    if (found) {
      homepage = found;
      updates.homepage = found;
      fieldsUpdated.push('homepage');
      valuesFound.homepage = found;
    }
  }

  // 2. Scrape homepage
  let homepageData: HomepageData | null = null;
  if (homepage) {
    homepageData = await scrapeHomepage(homepage);
  }

  // 3. Find favicon
  if (!station.favicon && homepage) {
    const faviconResult = await findFavicon(homepage, homepageData);
    if (faviconResult) {
      updates.favicon = faviconResult.url;
      fieldsUpdated.push('favicon');
      valuesFound.favicon = faviconResult.url;
      valuesFound.favicon_method = faviconResult.method;
    }
  }

  // 4. Infer country/countrycode
  if (!station.countrycode) {
    const countryInfo = await inferCountry(station);
    if (countryInfo) {
      updates.countrycode = countryInfo.countrycode;
      fieldsUpdated.push('countrycode');
      valuesFound.countrycode = countryInfo.countrycode;
      if (!station.country && countryInfo.country) {
        updates.country = countryInfo.country;
        fieldsUpdated.push('country');
        valuesFound.country = countryInfo.country;
      }
    }
  }

  // 5. Infer geo_lat/geo_long
  if (station.geo_lat == null || station.geo_long == null) {
    const geo = await inferGeoLocation(station, homepageData);
    if (geo) {
      updates.geo_lat = geo.lat;
      updates.geo_long = geo.lon;
      fieldsUpdated.push('geo_lat');
      fieldsUpdated.push('geo_long');
      valuesFound.geo_lat = String(geo.lat);
      valuesFound.geo_long = String(geo.lon);
      valuesFound.geo_method = geo.method;
      valuesFound.geo_query = geo.query;
    }
  }

  // 6. Infer language
  if (!station.language) {
    const lang = inferLanguage(homepageData);
    if (lang) {
      updates.language = lang;
      fieldsUpdated.push('language');
      valuesFound.language = lang;
    }
  }

  // 7. Infer tags
  if (!station.tags) {
    const tags = inferTags(station, homepageData);
    if (tags) {
      updates.tags = tags;
      fieldsUpdated.push('tags');
      valuesFound.tags = tags;
    }
  }

  // 8. Infer codec/bitrate from stream headers
  if (!station.codec || !station.bitrate) {
    const streamInfo = await inferCodecBitrate(station.url_resolved);
    if (streamInfo) {
      if (!station.codec && streamInfo.codec) {
        updates.codec = streamInfo.codec;
        fieldsUpdated.push('codec');
        valuesFound.codec = streamInfo.codec;
      }
      if (!station.bitrate && streamInfo.bitrate) {
        updates.bitrate = streamInfo.bitrate;
        fieldsUpdated.push('bitrate');
        valuesFound.bitrate = String(streamInfo.bitrate);
      }
    }
  }

  // 9. Update DB
  const db = getDb();
  const digStatus = fieldsUpdated.length > 0 ? 'done' : 'partial';
  const now = new Date().toISOString();

  if (Object.keys(updates).length > 0) {
    const sets = Object.keys(updates).map(k => `${k} = ?`);
    sets.push("dig_status = ?", "dig_at = ?", "updated_at = datetime('now')");
    const values = [...Object.values(updates), digStatus, now, station.stationuuid];
    db.prepare(`UPDATE stations SET ${sets.join(', ')} WHERE stationuuid = ?`).run(...values);
  } else {
    db.prepare("UPDATE stations SET dig_status = ?, dig_at = ?, updated_at = datetime('now') WHERE stationuuid = ?")
      .run(digStatus, now, station.stationuuid);
  }

  return { fieldsUpdated, valuesFound };
}

// --- Job Control ---

export function getDigState(): DigJobState {
  return { ...jobState, filled: { ...jobState.filled }, results: [...jobState.results] };
}

export function isDigBusy(): boolean {
  return jobState.status === 'running' || jobState.status === 'paused';
}

export function pauseDig(): boolean {
  if (jobState.status !== 'running') return false;
  jobState.status = 'paused';
  return true;
}

export function resumeDig(): boolean {
  if (jobState.status !== 'paused') return false;
  jobState.status = 'running';
  return true;
}

export function cancelDig(): boolean {
  if (jobState.status !== 'running' && jobState.status !== 'paused') return false;
  jobState.status = 'cancelled';
  return true;
}

async function waitWhilePaused(): Promise<boolean> {
  while (jobState.status === 'paused') {
    await sleep(500);
  }
  return jobState.status === 'running';
}

async function processWithConcurrency(stations: Station[], concurrency: number): Promise<void> {
  let index = 0;

  async function worker() {
    while (index < stations.length) {
      // Check pause/cancel
      if (jobState.status === 'paused') {
        const shouldContinue = await waitWhilePaused();
        if (!shouldContinue) return;
      }
      if (jobState.status === 'cancelled' || jobState.status === 'idle') return;

      const station = stations[index++];
      if (!station) return;

      jobState.currentStation = station.name;
      const startTime = Date.now();
      try {
        const { fieldsUpdated, valuesFound } = await autocompleteStation(station);
        for (const f of fieldsUpdated) incrementFilled(f);
        jobState.results.push({
          name: station.name,
          uuid: station.stationuuid,
          status: fieldsUpdated.length > 0 ? 'done' : 'partial',
          fieldsFilled: fieldsUpdated,
          valuesFound,
          error: null,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        jobState.errors++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        jobState.results.push({
          name: station.name,
          uuid: station.stationuuid,
          status: 'failed',
          fieldsFilled: [],
          valuesFound: {},
          error: errorMsg,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        // Mark as failed in DB
        try {
          const db = getDb();
          db.prepare("UPDATE stations SET dig_status = 'failed', dig_at = ? WHERE stationuuid = ?")
            .run(new Date().toISOString(), station.stationuuid);
        } catch { /* db error */ }
        console.error(`Dig error for "${station.name}":`, errorMsg);
      }
      jobState.processed++;
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, stations.length) }, () => worker());
  await Promise.all(workers);
}

export async function runAutocomplete(): Promise<void> {
  if (isDigBusy()) throw new Error('Dig job is already running');

  const db = getDb();
  const stations = db.prepare(`
    SELECT * FROM stations
    WHERE (dig_status IS NULL OR dig_status = 'failed') AND is_broken = 0
    ORDER BY clickcount DESC
    LIMIT ?
  `).all(config.dig.batchSize) as Station[];

  jobState.status = 'running';
  jobState.processed = 0;
  jobState.total = stations.length;
  jobState.filled = {};
  jobState.errors = 0;
  jobState.currentStation = '';
  jobState.results = [];

  try {
    await processWithConcurrency(stations, config.dig.concurrency);
  } finally {
    jobState.status = 'idle';
    jobState.currentStation = '';
  }
}

export async function runRecheck(): Promise<void> {
  if (isDigBusy()) throw new Error('Dig job is already running');

  const db = getDb();
  const stations = db.prepare(`
    SELECT * FROM stations
    WHERE dig_status IN ('done', 'partial')
    ORDER BY dig_at ASC
    LIMIT ?
  `).all(config.dig.batchSize) as Station[];

  jobState.status = 'running';
  jobState.processed = 0;
  jobState.total = stations.length;
  jobState.filled = {};
  jobState.errors = 0;
  jobState.currentStation = '';
  jobState.results = [];

  try {
    await processWithConcurrency(stations, config.dig.concurrency);
  } finally {
    jobState.status = 'idle';
    jobState.currentStation = '';
  }
}

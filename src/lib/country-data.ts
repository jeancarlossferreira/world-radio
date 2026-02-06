/**
 * @fileoverview Country data utilities for the radio app.
 *
 * This module provides mappings and functions for handling country information:
 * - Country code to continent mapping (for map filtering)
 * - Country code to primary language mapping
 * - Short/friendly country names (USA instead of "United States of America")
 * - Reverse lookup from common names to ISO codes (for search)
 *
 * ISO 3166-1 alpha-2 codes are used throughout (e.g., US, GB, BR).
 *
 * @example
 * import { getShortCountryName, getCountryCodeFromName } from '@/lib/country-data';
 *
 * // Get a friendly display name
 * getShortCountryName('United States of America', 'US'); // Returns 'USA'
 *
 * // Convert user input to API-compatible code
 * getCountryCodeFromName('USA'); // Returns 'US'
 */

/**
 * Maps ISO 3166-1 alpha-2 country codes to continent names.
 *
 * Used for filtering stations by region on the world map.
 * Continents: Africa, Asia, Europe, North America, Oceania, South America
 *
 * @example
 * COUNTRY_CONTINENT['US']; // 'North America'
 * COUNTRY_CONTINENT['JP']; // 'Asia'
 */
export const COUNTRY_CONTINENT: Record<string, string> = {
  AF:'Asia',AL:'Europe',DZ:'Africa',AS:'Oceania',AD:'Europe',AO:'Africa',
  AG:'North America',AR:'South America',AM:'Asia',AU:'Oceania',AT:'Europe',
  AZ:'Asia',BS:'North America',BH:'Asia',BD:'Asia',BB:'North America',
  BY:'Europe',BE:'Europe',BZ:'North America',BJ:'Africa',BT:'Asia',
  BO:'South America',BA:'Europe',BW:'Africa',BR:'South America',BN:'Asia',
  BG:'Europe',BF:'Africa',BI:'Africa',KH:'Asia',CM:'Africa',CA:'North America',
  CV:'Africa',CF:'Africa',TD:'Africa',CL:'South America',CN:'Asia',
  CO:'South America',KM:'Africa',CG:'Africa',CD:'Africa',CR:'North America',
  CI:'Africa',HR:'Europe',CU:'North America',CY:'Europe',CZ:'Europe',
  DK:'Europe',DJ:'Africa',DM:'North America',DO:'North America',EC:'South America',
  EG:'Africa',SV:'North America',GQ:'Africa',ER:'Africa',EE:'Europe',
  SZ:'Africa',ET:'Africa',FJ:'Oceania',FI:'Europe',FR:'Europe',GA:'Africa',
  GM:'Africa',GE:'Asia',DE:'Europe',GH:'Africa',GR:'Europe',GD:'North America',
  GT:'North America',GN:'Africa',GW:'Africa',GY:'South America',HT:'North America',
  HN:'North America',HU:'Europe',IS:'Europe',IN:'Asia',ID:'Asia',IR:'Asia',
  IQ:'Asia',IE:'Europe',IL:'Asia',IT:'Europe',JM:'North America',JP:'Asia',
  JO:'Asia',KZ:'Asia',KE:'Africa',KI:'Oceania',KP:'Asia',KR:'Asia',
  KW:'Asia',KG:'Asia',LA:'Asia',LV:'Europe',LB:'Asia',LS:'Africa',
  LR:'Africa',LY:'Africa',LI:'Europe',LT:'Europe',LU:'Europe',MG:'Africa',
  MW:'Africa',MY:'Asia',MV:'Asia',ML:'Africa',MT:'Europe',MH:'Oceania',
  MR:'Africa',MU:'Africa',MX:'North America',FM:'Oceania',MD:'Europe',
  MC:'Europe',MN:'Asia',ME:'Europe',MA:'Africa',MZ:'Africa',MM:'Asia',
  NA:'Africa',NR:'Oceania',NP:'Asia',NL:'Europe',NZ:'Oceania',NI:'North America',
  NE:'Africa',NG:'Africa',MK:'Europe',NO:'Europe',OM:'Asia',PK:'Asia',
  PW:'Oceania',PA:'North America',PG:'Oceania',PY:'South America',PE:'South America',
  PH:'Asia',PL:'Europe',PT:'Europe',QA:'Asia',RO:'Europe',RU:'Europe',
  RW:'Africa',KN:'North America',LC:'North America',VC:'North America',
  WS:'Oceania',SM:'Europe',ST:'Africa',SA:'Asia',SN:'Africa',RS:'Europe',
  SC:'Africa',SL:'Africa',SG:'Asia',SK:'Europe',SI:'Europe',SB:'Oceania',
  SO:'Africa',ZA:'Africa',SS:'Africa',ES:'Europe',LK:'Asia',SD:'Africa',
  SR:'South America',SE:'Europe',CH:'Europe',SY:'Asia',TW:'Asia',TJ:'Asia',
  TZ:'Africa',TH:'Asia',TL:'Asia',TG:'Africa',TO:'Oceania',TT:'North America',
  TN:'Africa',TR:'Asia',TM:'Asia',TV:'Oceania',UG:'Africa',UA:'Europe',
  AE:'Asia',GB:'Europe',US:'North America',UY:'South America',UZ:'Asia',
  VU:'Oceania',VE:'South America',VN:'Asia',YE:'Asia',ZM:'Africa',ZW:'Africa',
  XK:'Europe',PS:'Asia',HK:'Asia',MO:'Asia',PR:'North America',RE:'Africa',
  GP:'North America',MQ:'North America',GF:'South America',NC:'Oceania',
  PF:'Oceania',AW:'North America',CW:'North America',SX:'North America',
  BM:'North America',KY:'North America',GI:'Europe',FO:'Europe',GL:'North America',
  JE:'Europe',GG:'Europe',IM:'Europe',AX:'Europe',
};

/**
 * Maps ISO 3166-1 alpha-2 country codes to their primary language.
 *
 * Note: Many countries have multiple official languages; this provides
 * the most commonly spoken or official language for display purposes.
 *
 * @example
 * COUNTRY_LANGUAGE['BR']; // 'Portuguese'
 * COUNTRY_LANGUAGE['JP']; // 'Japanese'
 */
export const COUNTRY_LANGUAGE: Record<string, string> = {
  AF:'Pashto',AL:'Albanian',DZ:'Arabic',AD:'Catalan',AO:'Portuguese',
  AG:'English',AR:'Spanish',AM:'Armenian',AU:'English',AT:'German',
  AZ:'Azerbaijani',BS:'English',BH:'Arabic',BD:'Bengali',BB:'English',
  BY:'Belarusian',BE:'Dutch',BZ:'English',BJ:'French',BT:'Dzongkha',
  BO:'Spanish',BA:'Bosnian',BW:'English',BR:'Portuguese',BN:'Malay',
  BG:'Bulgarian',BF:'French',BI:'Kirundi',KH:'Khmer',CM:'French',
  CA:'English',CV:'Portuguese',CF:'French',TD:'French',CL:'Spanish',
  CN:'Mandarin',CO:'Spanish',KM:'Comorian',CG:'French',CD:'French',
  CR:'Spanish',CI:'French',HR:'Croatian',CU:'Spanish',CY:'Greek',
  CZ:'Czech',DK:'Danish',DJ:'French',DM:'English',DO:'Spanish',
  EC:'Spanish',EG:'Arabic',SV:'Spanish',GQ:'Spanish',ER:'Tigrinya',
  EE:'Estonian',SZ:'Swazi',ET:'Amharic',FJ:'English',FI:'Finnish',
  FR:'French',GA:'French',GM:'English',GE:'Georgian',DE:'German',
  GH:'English',GR:'Greek',GD:'English',GT:'Spanish',GN:'French',
  GW:'Portuguese',GY:'English',HT:'French',HN:'Spanish',HU:'Hungarian',
  IS:'Icelandic',IN:'Hindi',ID:'Indonesian',IR:'Persian',IQ:'Arabic',
  IE:'English',IL:'Hebrew',IT:'Italian',JM:'English',JP:'Japanese',
  JO:'Arabic',KZ:'Kazakh',KE:'Swahili',KI:'English',KP:'Korean',
  KR:'Korean',KW:'Arabic',KG:'Kyrgyz',LA:'Lao',LV:'Latvian',
  LB:'Arabic',LS:'Sotho',LR:'English',LY:'Arabic',LI:'German',
  LT:'Lithuanian',LU:'Luxembourgish',MG:'Malagasy',MW:'English',
  MY:'Malay',MV:'Dhivehi',ML:'French',MT:'Maltese',MH:'Marshallese',
  MR:'Arabic',MU:'English',MX:'Spanish',FM:'English',MD:'Romanian',
  MC:'French',MN:'Mongolian',ME:'Montenegrin',MA:'Arabic',MZ:'Portuguese',
  MM:'Burmese',NA:'English',NR:'Nauruan',NP:'Nepali',NL:'Dutch',
  NZ:'English',NI:'Spanish',NE:'French',NG:'English',MK:'Macedonian',
  NO:'Norwegian',OM:'Arabic',PK:'Urdu',PW:'Palauan',PA:'Spanish',
  PG:'English',PY:'Spanish',PE:'Spanish',PH:'Filipino',PL:'Polish',
  PT:'Portuguese',QA:'Arabic',RO:'Romanian',RU:'Russian',RW:'Kinyarwanda',
  KN:'English',LC:'English',VC:'English',WS:'Samoan',SM:'Italian',
  ST:'Portuguese',SA:'Arabic',SN:'French',RS:'Serbian',SC:'English',
  SL:'English',SG:'English',SK:'Slovak',SI:'Slovenian',SB:'English',
  SO:'Somali',ZA:'English',SS:'English',ES:'Spanish',LK:'Sinhala',
  SD:'Arabic',SR:'Dutch',SE:'Swedish',CH:'German',SY:'Arabic',
  TW:'Mandarin',TJ:'Tajik',TZ:'Swahili',TH:'Thai',TL:'Portuguese',
  TG:'French',TO:'Tongan',TT:'English',TN:'Arabic',TR:'Turkish',
  TM:'Turkmen',TV:'Tuvaluan',UG:'English',UA:'Ukrainian',AE:'Arabic',
  GB:'English',US:'English',UY:'Spanish',UZ:'Uzbek',VU:'English',
  VE:'Spanish',VN:'Vietnamese',YE:'Arabic',ZM:'English',ZW:'English',
  XK:'Albanian',PS:'Arabic',HK:'Chinese',MO:'Chinese',PR:'Spanish',
  RE:'French',GP:'French',MQ:'French',GF:'French',NC:'French',
  PF:'French',AW:'Dutch',CW:'Dutch',SX:'Dutch',BM:'English',
  KY:'English',GI:'English',FO:'Faroese',GL:'Greenlandic',JE:'English',
  GG:'English',IM:'English',AX:'Swedish',
};

/**
 * List of all continents used in the app.
 *
 * Defined as a const array for type safety. TypeScript infers the
 * type as a tuple of string literals, enabling type checking.
 *
 * `as const` makes this a readonly tuple, so:
 * - typeof CONTINENTS[number] = 'Africa' | 'Asia' | 'Europe' | ...
 */
export const CONTINENTS = [
  'Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America',
] as const;

/**
 * Returns a user-friendly short name for a country.
 *
 * The Radio Browser API returns formal country names like:
 * "The United Kingdom Of Great Britain And Northern Ireland"
 *
 * This function converts such names to friendlier versions:
 * - Uses predefined short names when available (US → USA)
 * - Removes "The" prefix
 * - Simplifies "Of" to just a space
 * - Converts "And" to "&"
 *
 * @param name - The full country name from the API
 * @param code - Optional ISO country code for lookup in COUNTRY_SHORT_NAMES
 * @returns A shorter, more readable country name
 *
 * @example
 * getShortCountryName('United States of America', 'US');
 * // Returns: 'USA'
 *
 * getShortCountryName('The United Kingdom Of Great Britain And Northern Ireland', 'GB');
 * // Returns: 'United Kingdom'
 *
 * getShortCountryName('The Republic Of Korea');
 * // Returns: 'Republic Korea' (no code provided, uses regex fallback)
 */
export function getShortCountryName(name: string, code?: string): string {
  // First, check if we have a predefined short name
  if (code && COUNTRY_SHORT_NAMES[code]) {
    return COUNTRY_SHORT_NAMES[code];
  }
  // Fallback: clean up the name using regex
  return name
    .replace(/^The\s+/i, '')      // Remove leading "The "
    .replace(/\s+Of\s+/gi, ' ')   // "Republic Of Korea" → "Republic Korea"
    .replace(/\s+And\s+/gi, ' & '); // "Trinidad And Tobago" → "Trinidad & Tobago"
}

/**
 * Maps ISO country codes to their commonly used short names.
 *
 * These are curated, user-friendly names that differ from the
 * formal names in the Radio Browser API. Only countries that
 * need shortening are included here.
 *
 * @example
 * COUNTRY_SHORT_NAMES['US']; // 'USA'
 * COUNTRY_SHORT_NAMES['GB']; // 'United Kingdom'
 * COUNTRY_SHORT_NAMES['KR']; // 'South Korea'
 */
export const COUNTRY_SHORT_NAMES: Record<string, string> = {
  AE: 'UAE',
  BA: 'Bosnia',
  BO: 'Bolivia',
  BN: 'Brunei',
  CD: 'DR Congo',
  CF: 'Central African Rep.',
  CG: 'Congo',
  CI: 'Ivory Coast',
  CZ: 'Czechia',
  DO: 'Dominican Rep.',
  FK: 'Falkland Islands',
  FM: 'Micronesia',
  GB: 'United Kingdom',
  IR: 'Iran',
  KP: 'North Korea',
  KR: 'South Korea',
  LA: 'Laos',
  MD: 'Moldova',
  MK: 'North Macedonia',
  MM: 'Myanmar',
  NL: 'Netherlands',
  PS: 'Palestine',
  RU: 'Russia',
  SH: 'Saint Helena',
  SY: 'Syria',
  TW: 'Taiwan',
  TZ: 'Tanzania',
  US: 'USA',
  VA: 'Vatican',
  VE: 'Venezuela',
  VG: 'British Virgin Is.',
  VI: 'US Virgin Is.',
};

/**
 * Reverse mapping: converts common country names to ISO codes.
 *
 * This enables users to search using familiar names like "USA" or "UK"
 * instead of having to know the ISO codes or formal API names.
 *
 * Built dynamically from COUNTRY_SHORT_NAMES, then augmented with
 * additional aliases (UK, England, America, etc.)
 */
const SHORT_NAME_TO_CODE: Record<string, string> = {};

// Populate from COUNTRY_SHORT_NAMES (reversed)
for (const [code, name] of Object.entries(COUNTRY_SHORT_NAMES)) {
  SHORT_NAME_TO_CODE[name.toLowerCase()] = code;
}

// Add common aliases that users might type
SHORT_NAME_TO_CODE['uk'] = 'GB';
SHORT_NAME_TO_CODE['england'] = 'GB';
SHORT_NAME_TO_CODE['britain'] = 'GB';
SHORT_NAME_TO_CODE['america'] = 'US';
SHORT_NAME_TO_CODE['united states'] = 'US';
SHORT_NAME_TO_CODE['korea'] = 'KR'; // Defaults to South Korea

/**
 * Converts a user-friendly country name to an ISO 3166-1 alpha-2 code.
 *
 * This function enables the search feature to accept common names
 * like "USA", "UK", or "Korea" and convert them to the ISO codes
 * that the Radio Browser API expects.
 *
 * The lookup is case-insensitive and trims whitespace.
 *
 * @param name - A country name or alias entered by the user
 * @returns The ISO country code, or null if not found
 *
 * @example
 * getCountryCodeFromName('USA');    // Returns: 'US'
 * getCountryCodeFromName('uk');     // Returns: 'GB'
 * getCountryCodeFromName('Korea');  // Returns: 'KR'
 * getCountryCodeFromName('France'); // Returns: null (not in aliases)
 */
export function getCountryCodeFromName(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return SHORT_NAME_TO_CODE[lower] || null;
}

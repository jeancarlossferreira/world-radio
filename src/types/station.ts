export interface Station {
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
  has_extended_info: boolean;
  lastchangetime_iso8601: string;
  lastcheckok: number;
}

export interface HistoryEntry {
  station: Station;
  playedAt: string;
}

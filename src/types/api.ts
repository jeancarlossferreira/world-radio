export interface Country {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

export interface Tag {
  name: string;
  stationcount: number;
}

export interface SearchParams {
  name?: string;
  tag?: string;
  country?: string;
  countrycode?: string;
  codec?: string;
  bitrateMin?: number;
  bitrateMax?: number;
  has_geo_info?: boolean;
  is_https?: boolean;
  order?: string;
  reverse?: boolean;
  offset?: number;
  limit?: number;
  hidebroken?: boolean;
}

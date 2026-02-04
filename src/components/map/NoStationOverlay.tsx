import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { PathOptions } from 'leaflet';
import * as topojson from 'topojson-client';
import { getCountries } from '@/lib/api';

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric to alpha-2
const N2A: Record<string, string> = {
  '004':'AF','008':'AL','012':'DZ','016':'AS','020':'AD','024':'AO','028':'AG',
  '032':'AR','051':'AM','036':'AU','040':'AT','031':'AZ','044':'BS','048':'BH',
  '050':'BD','052':'BB','112':'BY','056':'BE','084':'BZ','204':'BJ','060':'BM',
  '064':'BT','068':'BO','070':'BA','072':'BW','076':'BR','096':'BN','100':'BG',
  '854':'BF','108':'BI','132':'CV','116':'KH','120':'CM','124':'CA','140':'CF',
  '148':'TD','152':'CL','156':'CN','170':'CO','174':'KM','178':'CG','180':'CD',
  '188':'CR','384':'CI','191':'HR','192':'CU','196':'CY','203':'CZ','208':'DK',
  '262':'DJ','212':'DM','214':'DO','218':'EC','818':'EG','222':'SV','226':'GQ',
  '232':'ER','233':'EE','748':'SZ','231':'ET','242':'FJ','246':'FI','250':'FR',
  '266':'GA','270':'GM','268':'GE','276':'DE','288':'GH','300':'GR','308':'GD',
  '320':'GT','324':'GN','624':'GW','328':'GY','332':'HT','340':'HN','348':'HU',
  '352':'IS','356':'IN','360':'ID','364':'IR','368':'IQ','372':'IE','376':'IL',
  '380':'IT','388':'JM','392':'JP','400':'JO','398':'KZ','404':'KE','296':'KI',
  '408':'KP','410':'KR','414':'KW','417':'KG','418':'LA','428':'LV','422':'LB',
  '426':'LS','430':'LR','434':'LY','438':'LI','440':'LT','442':'LU','450':'MG',
  '454':'MW','458':'MY','462':'MV','466':'ML','470':'MT','480':'MU','484':'MX',
  '498':'MD','492':'MC','496':'MN','499':'ME','504':'MA','508':'MZ','104':'MM',
  '516':'NA','524':'NP','528':'NL','554':'NZ','558':'NI','562':'NE','566':'NG',
  '807':'MK','578':'NO','512':'OM','586':'PK','591':'PA','598':'PG','600':'PY',
  '604':'PE','608':'PH','616':'PL','620':'PT','634':'QA','642':'RO','643':'RU',
  '646':'RW','662':'LC','670':'VC','882':'WS','674':'SM','678':'ST','682':'SA',
  '686':'SN','688':'RS','690':'SC','694':'SL','702':'SG','703':'SK','705':'SI',
  '090':'SB','706':'SO','710':'ZA','728':'SS','724':'ES','144':'LK','729':'SD',
  '740':'SR','752':'SE','756':'CH','760':'SY','158':'TW','762':'TJ','834':'TZ',
  '764':'TH','626':'TL','768':'TG','776':'TO','780':'TT','788':'TN','792':'TR',
  '795':'TM','800':'UG','804':'UA','784':'AE','826':'GB','840':'US','858':'UY',
  '860':'UZ','548':'VU','862':'VE','704':'VN','887':'YE','894':'ZM','716':'ZW',
  '900':'XK','275':'PS','344':'HK','446':'MO','630':'PR','736':'SD',
  '010':'AQ','074':'BV','162':'CX','166':'CC','184':'CK','238':'FK','254':'GF',
  '260':'TF','292':'GI','304':'GL','312':'GP','316':'GU','334':'HM','474':'MQ',
  '175':'YT','540':'NC','570':'NU','574':'NF','580':'MP','612':'PN','638':'RE',
  '654':'SH','666':'PM','652':'BL','663':'MF','534':'SX','239':'GS','744':'SJ',
  '772':'TK','796':'TC','850':'VI','876':'WF','732':'EH',
};

let geoCache: any = null;
let stationCodesCache: Set<string> | null = null;

export function NoStationOverlay() {
  const [geoData, setGeoData] = useState<any>(geoCache);
  const [stationCodes, setStationCodes] = useState<Set<string> | null>(stationCodesCache);

  useEffect(() => {
    if (!geoCache) {
      fetch(TOPO_URL)
        .then(r => r.json())
        .then(topo => {
          const geo = topojson.feature(topo, topo.objects.countries) as any;
          geoCache = geo;
          setGeoData(geo);
        })
        .catch(() => {});
    }

    if (!stationCodesCache) {
      getCountries().then(countries => {
        const set = new Set(countries.map(c => c.iso_3166_1));
        stationCodesCache = set;
        setStationCodes(set);
      }).catch(() => {});
    }
  }, []);

  if (!geoData || !stationCodes) return null;

  const style = (feature: any): PathOptions => {
    const numericId = String(feature?.id || '');
    const alpha2 = N2A[numericId];
    const hasStations = alpha2 && stationCodes.has(alpha2);

    if (hasStations) {
      return {
        fillOpacity: 0,
        stroke: false,
      };
    }

    return {
      fillColor: '#5c1a1a',
      fillOpacity: 0.6,
      color: '#3d1111',
      weight: 1,
    };
  };

  return <GeoJSON key="no-station-overlay" data={geoData} style={style} />;
}

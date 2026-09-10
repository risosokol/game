import { landmarkAnchors } from './landmarkAnchors.generated';

export type LandmarkCategory = 'heritage' | 'religious' | 'civic' | 'nature' | 'transport';

export interface Landmark {
  id: string;
  name: string;
  category: LandmarkCategory;
  tileX: number;
  tileY: number;
  shortDescription: string;
  info: string;
  /** id of a BuildingFootprint (in cityLayout.ts) this landmark is attached to, if any. */
  buildingId?: string;
}

/**
 * Ten real, verified Trebišov landmarks. Names, denominations, and
 * historic classifications below all come directly from the OpenStreetMap
 * tags on the matching real building/point (see
 * scripts/generate-city-data.mjs for the OSM id -> landmark id mapping and
 * data/osm/README.md for provenance) — nothing here is invented. Tile
 * positions come from `landmarkAnchors.generated.ts`, itself derived from
 * the real lat/lon of each feature.
 */
function anchor(id: string) {
  const a = landmarkAnchors[id];
  if (!a) throw new Error(`Missing generated anchor for landmark "${id}" — re-run scripts/generate-city-data.mjs`);
  return a;
}

export const landmarks: Landmark[] = [
  {
    id: 'andrassy_manor',
    name: 'Kaštieľ Andrássyovcov',
    category: 'heritage',
    ...anchor('andrassy_manor'),
    shortDescription: 'The Andrássy family manor house, Trebišov\'s grandest historic building.',
    info:
      'The Andrássy manor house was the seat of the noble Andrássy family, long the dominant landowners of the Trebišov area. It now houses the town\'s Zemplín museum collections, and gives its name to the English-style park that still surrounds it.',
  },
  {
    id: 'mestsky_park',
    name: 'Mestský park (Andrássyovský park)',
    category: 'nature',
    ...anchor('mestsky_park'),
    shortDescription: 'A shaded English landscape park surrounding the Andrássy manor.',
    info:
      'Laid out in the English landscape style around the manor house, the town park — known locally as the Andrássy park — is one of Trebišov\'s largest and greenest public spaces, with old trees, open lawns, and quiet walking paths.',
  },
  {
    id: 'koniaren_gallery',
    name: 'Koniareň',
    category: 'heritage',
    ...anchor('koniaren_gallery'),
    shortDescription: 'A former manor stable building, now an art gallery.',
    info:
      '"Koniareň" is Slovak for stable — this building once housed horses for the Andrássy manor estate. Restored and repurposed, it now operates as a gallery space on the same grounds as the manor and its park.',
  },
  {
    id: 'parish_church',
    name: 'Kostol Navštevy Panny Márie',
    category: 'religious',
    ...anchor('parish_church'),
    shortDescription: 'The Roman Catholic parish church on Mariánske námestie.',
    info:
      'The Church of the Visitation of the Virgin Mary is Trebišov\'s Roman Catholic parish church, standing on Mariánske námestie — the town\'s historic Marian Square — alongside a Greek Catholic church just a short walk away.',
  },
  {
    id: 'greekcatholic_church',
    name: 'Chrám Zosnutia presvätej Bohorodičky',
    category: 'religious',
    ...anchor('greekcatholic_church'),
    shortDescription: 'A Greek Catholic church on Mariánske námestie.',
    info:
      'The Church of the Dormition of the Most Holy Mother of God is a Greek Catholic church standing close to the Roman Catholic parish church on Mariánske námestie — a reflection of the mixed Christian traditions found across the Zemplín region.',
  },
  {
    id: 'town_hall',
    name: 'Mestský úrad',
    category: 'civic',
    ...anchor('town_hall'),
    shortDescription: 'The seat of Trebišov\'s municipal government.',
    info:
      'The town hall houses the offices of the mayor and municipal council who administer Trebišov, the seat of the Trebišov District in the Košice Region.',
  },
  {
    id: 'culture_centre',
    name: 'Mestské kultúrne stredisko',
    category: 'civic',
    ...anchor('culture_centre'),
    shortDescription: 'The town\'s cultural centre, on M. R. Štefánika street.',
    info:
      'The municipal cultural centre hosts concerts, film screenings, and community events, and is a hub of Trebišov\'s social and cultural life outside its historic monuments.',
  },
  {
    id: 'andrassy_mausoleum',
    name: 'Mauzóleum grófa Júliusa Andrássyho',
    category: 'heritage',
    ...anchor('andrassy_mausoleum'),
    shortDescription: 'The mausoleum of Count Gyula (Július) Andrássy.',
    info:
      'A quiet tomb built for Count Gyula (Július) Andrássy, a member of the noble family whose manor house and park still stand at the centre of town — one more trace of the Andrássy family\'s long presence in Trebišov.',
  },
  {
    id: 'paric_castle',
    name: 'Parič',
    category: 'heritage',
    ...anchor('paric_castle'),
    shortDescription: 'The ruins of a former defensive castle on the edge of town.',
    info:
      'Parič was once a defensive castle overlooking the area around Trebišov. Only ruins remain today, tucked away among the trees — a quieter, older layer of the town\'s history.',
  },
  {
    id: 'train_station',
    name: 'Železničná stanica a autobusová stanica Trebišov',
    category: 'transport',
    ...anchor('train_station'),
    shortDescription: 'Trebišov\'s railway and bus terminal.',
    info:
      'Trebišov\'s railway and bus terminal connects the town to Košice and the wider Zemplín region. The adjoining station has long made Trebišov a transport hub for this part of eastern Slovakia.',
  },
];

export function getLandmarkById(id: string): Landmark | undefined {
  return landmarks.find((l) => l.id === id);
}

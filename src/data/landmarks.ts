import { buildings } from '@/world/cityLayout';

export type LandmarkCategory = 'heritage' | 'religious' | 'civic' | 'nature' | 'transport';

export interface Landmark {
  id: string;
  name: string;
  category: LandmarkCategory;
  /** Real-world approximate coordinates, kept for reference / future OSM swap. */
  lat: number;
  lon: number;
  /** Tile-space interaction point the player must be near to trigger discovery. */
  tileX: number;
  tileY: number;
  shortDescription: string;
  info: string;
  /** id of a BuildingFootprint this landmark is attached to, if any. */
  buildingId?: string;
}

function buildingCenter(id: string, southOffset = 2) {
  const b = buildings.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown building id for landmark: ${id}`);
  return { tileX: b.x + b.w / 2, tileY: b.y + b.h + southOffset };
}

export const landmarks: Landmark[] = [
  {
    id: 'andrassy_manor',
    name: 'Kaštieľ Andrássyovcov',
    category: 'heritage',
    lat: 48.6349,
    lon: 21.7141,
    ...buildingCenter('manor', 2),
    buildingId: 'manor',
    shortDescription: 'The Andrássy manor house, Trebišov\'s grandest historic building.',
    info:
      'The Andrássy manor house was the seat of the noble Andrássy family, long the dominant landowners of the Trebišov area. Rebuilt over the centuries into its present Classicist form, it now anchors the town\'s cultural life and houses regional museum collections covering the history of the Zemplín region.',
  },
  {
    id: 'kastiel_park',
    name: 'Kaštieľny park',
    category: 'nature',
    lat: 48.6338,
    lon: 21.7148,
    tileX: 48,
    tileY: 51,
    shortDescription: 'A shaded English landscape park surrounding the manor.',
    info:
      'Laid out in the English landscape style around the manor house, this park has been a favourite place for townsfolk to walk, rest and gather for generations. Its winding paths, old trees and open lawns make it one of the greenest and most peaceful corners of Trebišov.',
  },
  {
    id: 'parish_church',
    name: 'Kostol Navštívenia Panny Márie',
    category: 'religious',
    lat: 48.6327,
    lon: 21.7189,
    ...buildingCenter('parish_church', 2),
    buildingId: 'parish_church',
    shortDescription: 'The Roman Catholic parish church on the town square.',
    info:
      'The Church of the Visitation of the Virgin Mary is the town\'s principal Roman Catholic parish church, standing near the historic square for centuries. It has been rebuilt and altered many times, reflecting the changing architectural tastes of the region while remaining the spiritual center of the parish.',
  },
  {
    id: 'reformed_church',
    name: 'Reformovaný kostol',
    category: 'religious',
    lat: 48.6341,
    lon: 21.7168,
    ...buildingCenter('reformed_church', 2),
    buildingId: 'reformed_church',
    shortDescription: 'A Reformed (Calvinist) church serving the local congregation.',
    info:
      'The Reformed church reflects the historically mixed confessional character of Trebišov and the wider Zemplín region, where Roman Catholic, Reformed and other communities have long lived side by side. Its plain, dignified architecture is typical of Reformed churches across eastern Slovakia.',
  },
  {
    id: 'town_hall',
    name: 'Mestský úrad',
    category: 'civic',
    lat: 48.6332,
    lon: 21.7162,
    ...buildingCenter('town_hall', 2),
    buildingId: 'town_hall',
    shortDescription: 'The seat of Trebišov\'s municipal government.',
    info:
      'The town hall houses the offices of the mayor and municipal council, who administer Trebišov as the seat of the Trebišov District in the Košice Region. It sits close to the main square, at the civic heart of the town.',
  },
  {
    id: 'synagogue',
    name: 'Synagóga',
    category: 'heritage',
    lat: 48.6318,
    lon: 21.7184,
    ...buildingCenter('synagogue', 2),
    buildingId: 'synagogue',
    shortDescription: 'A historic synagogue, a legacy of Trebišov\'s Jewish community.',
    info:
      'Trebišov once had a sizeable Jewish community that played an important part in the town\'s trade and civic life before being devastated in the Holocaust. The surviving synagogue building stands as a reminder of that history and today serves cultural and community purposes.',
  },
  {
    id: 'culture_house',
    name: 'Dom kultúry',
    category: 'civic',
    lat: 48.6335,
    lon: 21.7205,
    ...buildingCenter('culture_house', 2),
    buildingId: 'culture_house',
    shortDescription: 'The town\'s cultural centre for events, film and theatre.',
    info:
      'The House of Culture hosts concerts, theatre, film screenings and community events throughout the year, and is a hub of Trebišov\'s social and cultural life outside of its historic monuments.',
  },
  {
    id: 'train_station',
    name: 'Železničná stanica Trebišov',
    category: 'transport',
    lat: 48.6289,
    lon: 21.7244,
    ...buildingCenter('train_station', 2),
    buildingId: 'train_station',
    shortDescription: 'Trebišov\'s railway station, a key junction in the Zemplín region.',
    info:
      'Trebišov\'s railway station sits on the line linking Košice with the towns of eastern Zemplín and border crossings further east. For over a century the railway has shaped the town\'s growth as a regional transport and trade hub.',
  },
  {
    id: 'kalvaria',
    name: 'Kalvária',
    category: 'religious',
    lat: 48.6281,
    lon: 21.7168,
    ...buildingCenter('kalvaria_chapel', 2),
    buildingId: 'kalvaria_chapel',
    shortDescription: 'A hilltop chapel offering a quiet view over the town.',
    info:
      'Like many towns in the region, Trebišov has its own Kalvária — a modest hilltop chapel and devotional site historically used for Catholic processions and quiet reflection, set apart from the bustle of the centre.',
  },
];

export function getLandmarkById(id: string): Landmark | undefined {
  return landmarks.find((l) => l.id === id);
}

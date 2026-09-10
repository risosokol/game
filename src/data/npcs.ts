import { landmarkAnchors } from './landmarkAnchors.generated';

export interface NpcDefinition {
  id: string;
  name: string;
  paletteId: 0 | 1 | 2;
  /** Tile-space patrol path; NPC idles/walks a short loop between these points. */
  patrol: { x: number; y: number }[];
  dialogue: string[];
}

function near(id: string, dx: number, dy: number): { x: number; y: number } {
  const a = landmarkAnchors[id];
  return { x: Math.round(a.tileX + dx), y: Math.round(a.tileY + dy) };
}

export const npcDefinitions: NpcDefinition[] = [
  {
    id: 'npc_elder',
    name: 'Pán Kováč',
    paletteId: 0,
    patrol: [
      near('andrassy_manor', -10, 2), near('mestsky_park', -6, 4),
      near('mestsky_park', 2, -2), near('andrassy_manor', -10, 2),
    ],
    dialogue: [
      'This park has hardly changed since I was a boy — same old trees, same quiet.',
      'The manor over there has seen a few centuries go by. Worth a proper look.',
      'Come in autumn — the whole park turns gold. Best time of year here.',
    ],
  },
  {
    id: 'npc_resident',
    name: 'Pani Horváthová',
    paletteId: 1,
    patrol: [
      near('parish_church', -6, 3), near('greekcatholic_church', 5, 3),
      near('parish_church', 0, 6), near('parish_church', -6, 3),
    ],
    dialogue: [
      'If you\'re exploring, don\'t miss both churches here on the square — they stand right next to each other.',
      'The Koniareň gallery is just past the manor. Small, but worth a look.',
      'Nice day for a walk, isn\'t it? The square is quiet like this most mornings.',
    ],
  },
  {
    id: 'npc_railway',
    name: 'Jožko',
    paletteId: 2,
    patrol: [
      near('train_station', -6, 3), near('train_station', 6, 3), near('train_station', -6, 3),
    ],
    dialogue: [
      'Trains from here run toward Košice and out east — Trebišov\'s always been a junction town.',
      'Follow M. R. Štefánika street south and you\'ll walk straight into the old town.',
      'Station\'s a bit quiet right now, but it gets busy morning and evening.',
    ],
  },
  {
    id: 'npc_student',
    name: 'Zuzka',
    paletteId: 1,
    patrol: [
      near('culture_centre', -4, 3), near('town_hall', 3, -2), near('culture_centre', -4, 3),
    ],
    dialogue: [
      'The cultural centre has something on almost every week — check the noticeboard.',
      'Have you seen the mausoleum yet? Easy to miss, but it\'s just past the park.',
      'Have you been out to Parič yet? Just ruins now, but a nice quiet walk.',
    ],
  },
];

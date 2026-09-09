export interface NpcDefinition {
  id: string;
  name: string;
  paletteId: 0 | 1 | 2;
  /** Tile-space patrol path; NPC idles/walks a short loop between these points. */
  patrol: { x: number; y: number }[];
  dialogue: string[];
}

export const npcDefinitions: NpcDefinition[] = [
  {
    id: 'npc_elder',
    name: 'Pán Kováč',
    paletteId: 0,
    patrol: [
      { x: 40, y: 34 }, { x: 40, y: 50 }, { x: 44, y: 50 }, { x: 40, y: 50 },
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
      { x: 66, y: 60 }, { x: 74, y: 60 }, { x: 70, y: 66 }, { x: 74, y: 60 },
    ],
    dialogue: [
      'If you\'re exploring, don\'t miss the church on the square — it\'s the heart of the old town.',
      'The synagogue is just south of here. Small, but it has a lot of history behind it.',
      'Nice day for a walk, isn\'t it? The square is quiet like this most mornings.',
    ],
  },
  {
    id: 'npc_railway',
    name: 'Jožko',
    paletteId: 2,
    patrol: [
      { x: 114, y: 92 }, { x: 120, y: 92 }, { x: 114, y: 92 },
    ],
    dialogue: [
      'Trains from here run toward Košice and out east — Trebišov\'s always been a junction town.',
      'Follow the main street north and you\'ll walk straight into the town centre.',
      'Station\'s a bit quiet right now, but it gets busy morning and evening.',
    ],
  },
  {
    id: 'npc_student',
    name: 'Zuzka',
    paletteId: 1,
    patrol: [
      { x: 90, y: 58 }, { x: 94, y: 62 }, { x: 90, y: 58 },
    ],
    dialogue: [
      'The house of culture has something on almost every week — check the noticeboard.',
      'I like cutting through the square on my way home, it\'s never far from anything here.',
      'Have you been up to the Kalvária yet? Nice view over the rooftops from up there.',
    ],
  },
];

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  /** Landmark ids required to complete the quest. */
  requiredLandmarks: string[];
}

export const questDefinitions: QuestDefinition[] = [
  {
    id: 'quest_faith',
    title: 'Mariánske námestie',
    description: 'Visit both churches on the Marian Square.',
    requiredLandmarks: ['parish_church', 'greekcatholic_church'],
  },
  {
    id: 'quest_andrassy',
    title: 'The Andrássy Legacy',
    description: 'Discover the manor, its park, the gallery and the mausoleum.',
    requiredLandmarks: ['andrassy_manor', 'mestsky_park', 'koniaren_gallery', 'andrassy_mausoleum'],
  },
  {
    id: 'quest_grand_tour',
    title: 'The Grand Tour',
    description: 'Discover every landmark in town.',
    requiredLandmarks: [
      'andrassy_manor', 'mestsky_park', 'koniaren_gallery', 'parish_church',
      'greekcatholic_church', 'town_hall', 'culture_centre', 'andrassy_mausoleum',
      'paric_castle', 'train_station',
    ],
  },
];

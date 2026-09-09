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
    title: 'Places of Faith',
    description: 'Visit the parish church, the reformed church and the synagogue.',
    requiredLandmarks: ['parish_church', 'reformed_church', 'synagogue'],
  },
  {
    id: 'quest_green',
    title: 'Green Trebišov',
    description: 'Discover the manor and its English park.',
    requiredLandmarks: ['andrassy_manor', 'kastiel_park'],
  },
  {
    id: 'quest_grand_tour',
    title: 'The Grand Tour',
    description: 'Discover every landmark in town.',
    requiredLandmarks: [
      'andrassy_manor', 'kastiel_park', 'parish_church', 'reformed_church',
      'town_hall', 'synagogue', 'culture_house', 'train_station', 'kalvaria',
    ],
  },
];

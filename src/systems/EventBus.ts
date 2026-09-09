import Phaser from 'phaser';

/** Cross-scene communication bus between WorldScene and the UIScene overlay
 * (HUD, interaction prompt, journal, dialogue, minimap). Kept as a single
 * shared emitter instance rather than routing everything through
 * scene.events, since the two scenes are siblings, not parent/child. */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  INTERACTION_AVAILABLE: 'interaction-available',
  INTERACTION_UNAVAILABLE: 'interaction-unavailable',
  LANDMARK_DISCOVERED: 'ui-landmark-discovered',
  DIALOGUE_OPENED: 'dialogue-opened',
  DIALOGUE_CLOSED: 'dialogue-closed',
  JOURNAL_TOGGLE: 'journal-toggle',
  QUEST_COMPLETED: 'ui-quest-completed',
  PLAYER_TILE_MOVED: 'player-tile-moved',
} as const;

export type InteractionTarget =
  | { kind: 'landmark'; id: string; name: string }
  | { kind: 'npc'; id: string; name: string };

/**
 * Central tunables for the game. Nothing gameplay-specific should be
 * hard-coded outside of this file and the data files under src/data.
 */
export const TILE_SIZE = 32;

export const DEPTH = {
  GROUND: 0,
  GROUND_DETAIL: 5,
  SHADOW: 8,
  PROP: 10,
  BUILDING: 20,
  PLAYER: 30,
  NPC: 29,
  OVERLAY: 40,
  UI: 1000,
} as const;

export const STORAGE_KEYS = {
  SAVE: 'trebisov-pixel-explorer:save:v1',
} as const;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  WORLD: 'WorldScene',
  UI: 'UIScene',
} as const;

export const PLAYER_SPEED = 140;
export const PLAYER_RUN_SPEED = 220;

export const INTERACTION_RADIUS_TILES = 1.6;

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

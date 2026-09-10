/**
 * All texture/animation keys used by the game. Centralised so the
 * procedural generator (PixelArtFactory) and consumers (World/UI scenes)
 * never drift apart on naming.
 */
/**
 * The player and every NPC share one real 4-direction walk-cycle
 * spritesheet (32x48 per frame, 6 frames) — see PreloadScene, which loads
 * it once per direction as `character_walk_<dir>`. NPCs get a tint
 * (Phaser setTint) instead of a separate sprite, since only one character
 * skin ships in the source pack.
 */
export const CharacterSheetKeys = {
  sheet: (dir: 'down' | 'up' | 'left' | 'right') => `character_walk_${dir}`,
};
export const CHARACTER_FRAME_WIDTH = 32;
export const CHARACTER_FRAME_HEIGHT = 48;
export const CHARACTER_WALK_FRAME_COUNT = 6;
/** Frame index used for the standing/idle pose. */
export const CHARACTER_IDLE_FRAME = 0;

export const NPC_TINTS = [0xffb199, 0x9fe0a0, 0xb3a6ff] as const;

export const PropTextureKeys = {
  tree: 'prop_tree', // kept as a fallback key; actual trees pick tree_a..tree_d, see PropTextureKeys.treeVariant
  treeVariant: (i: number) => `tree_${['a', 'b', 'c', 'd'][i % 4]}`,
  lamp: 'prop_lamp',
  bench: 'prop_bench',
  busstop: 'prop_busstop',
  flowerbed: 'prop_flowerbed',
  fountain: 'prop_fountain',
  sign: 'prop_sign',
  bike: 'prop_bike',
  car: 'prop_car',
  noticeboard: 'prop_noticeboard',
  monument: 'prop_monument',
  shadowSmall: 'prop_shadow_sm',
  shadowMed: 'prop_shadow_md',
};

export const UITextureKeys = {
  cursor: 'ui_cursor',
  interactIcon: 'ui_interact',
  journalIcon: 'ui_journal_icon',
  panel: 'ui_panel',
};

export function buildingTextureKey(id: string): string {
  return `building_${id}`;
}

/** Real grass ground texture (replaces the procedurally-drawn grass tile
 * in the tileset strip). See PreloadScene / PixelArtFactory.generateTiles. */
export const REAL_GRASS_KEY = 'real_grass';

/** Six-layer parallax title screen background (village01 half-timbered
 * houses pack), back-to-front: layer5 (sky/far treeline) .. layer0
 * (foreground cobbles). See TitleScene. */
export const TitleBgLayerKeys = {
  layer: (i: number) => `title_bg_layer${i}`,
};
export const TITLE_BG_LAYER_COUNT = 6;

/** 34-frame sparkle burst, played once on a landmark discovery. */
export const SparkleFrameKeys = {
  frame: (i: number) => `sparkle_${i}`,
};
export const SPARKLE_FRAME_COUNT = 34;

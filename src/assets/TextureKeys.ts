/**
 * All texture/animation keys used by the game. Centralised so the
 * procedural generator (PixelArtFactory) and consumers (World/UI scenes)
 * never drift apart on naming.
 */
export const PlayerTextureKeys = {
  idle: (dir: string) => `player_idle_${dir}`,
  walk: (dir: string, frame: number) => `player_walk_${dir}_${frame}`,
};

export const NpcTextureKeys = {
  idle: (paletteId: number, dir: string) => `npc${paletteId}_idle_${dir}`,
  walk: (paletteId: number, dir: string, frame: number) => `npc${paletteId}_walk_${dir}_${frame}`,
};

export const PropTextureKeys = {
  tree: 'prop_tree',
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
  titleBg: 'ui_title_bg',
};

export function buildingTextureKey(id: string): string {
  return `building_${id}`;
}

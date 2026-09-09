# TREBIŠOV: Pixel Explorer *(working title)*

A 2.5D pixel-art exploration game recreating a real, walkable slice of
**Trebišov, Slovakia** — its main street and square, the Andrássy manor and
its English park, the parish and reformed churches, the synagogue, the town
hall, the railway station, and the Kalvária hill. No combat: the loop is
*explore → discover a landmark → learn something real about it → it's added
to your Discovery Journal → keep exploring.*

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build     # type-checks, then builds a production bundle to dist/
npm run preview   # serve the production build locally
```

No paid APIs, no proprietary SDKs, no external asset downloads required.

## Controls

- **WASD** / **Arrow keys** — move (8-directional)
- **Shift** — jog
- **E** — interact (discover a landmark / talk to an NPC)
- **J** / **Esc** — toggle the Discovery Journal

## What's actually implemented

- A hand-authored, geography-grounded street/park/plaza layout for central
  Trebišov, rasterized onto a tile grid and rendered as a real Phaser
  Tilemap (camera-culled automatically).
- 9 real, discoverable Trebišov landmarks (Andrássy manor, its English
  park, the parish church, the reformed church, the town hall, the
  synagogue, the house of culture, the railway station, the Kalvária) with
  short factual descriptions.
- A player character with 4-direction walk/idle animation, Arcade Physics
  collision against every building footprint, and a smoothly-following
  camera.
- An interaction system (proximity prompt → info panel → journal entry),
  a Discovery Journal (locked/unlocked cards + 3 light exploration
  quests), a stylized minimap, a few ambient NPCs with short dialogue,
  a placeholder audio system, a title screen, and a subtle daytime
  lighting overlay.
- Save/load via `localStorage` (discovered landmarks, quest progress,
  player position, audio settings) — progress survives a refresh.

## Why the art and map are "procedural placeholder" / hand-authored

This prototype was built in an environment with **no outbound network
access** to image hosts or the OpenStreetMap/Overpass/Nominatim APIs. Per
the project brief's own fallback instructions, it leans on two
substitutions that keep the game fully playable without either:

1. **Art**: every texture (tiles, buildings, player, NPCs, props, UI chrome)
   is generated at boot time from vector primitives via Phaser's
   `Graphics → generateTexture`, see `src/assets/PixelArtFactory.ts`. This
   is clearly isolated placeholder art — swapping in hand-drawn sprites
   later just means loading real images under the same keys
   (`src/assets/TextureKeys.ts`) in `PreloadScene` instead of calling the
   factory; nothing downstream changes.
2. **Map geometry**: `src/world/cityLayout.ts` is a small, hand-authored
   vertical slice — straightened streets, simplified building footprints —
   laid out to match Trebišov's real relative geography from public
   knowledge (main street & square, the manor + park west of centre, the
   churches/town hall/synagogue clustered near the square, the station to
   the south-east). It is **not** OSM data.

### Where to plug in real OpenStreetMap data later

- `src/geo/GeoTransform.ts` is the single seam between real-world lat/lon
  and game tile-space (`project()` / `projectToPixels()`). Every landmark's
  approximate real coordinates already flow through it.
- To go further: fetch an Overpass QL export for the Trebišov bounding box
  (roads, building footprints, `landuse=grass/forest`, `natural=water`,
  `railway`) as GeoJSON, write an importer next to `GeoTransform.ts` that
  projects every coordinate through `project()`, and feed the resulting
  polygons into a new generator (parallel to `world/MapBuilder.ts`) that
  rasterizes them onto the `TileGrid` instead of the hand-authored data in
  `cityLayout.ts`. Nothing in rendering, collision, landmarks, the
  journal, or the minimap needs to change — they all only ever consume
  tile-space coordinates.

## Architecture

```
src/
  config/         Central tunables (tile size, depth layers, keys) — nothing
                   gameplay-specific is hard-coded outside this + data files.
  geo/            Lat/lon <-> tile-space transform layer (see above).
  world/          TileGrid, hand-authored cityLayout data, MapBuilder
                   (rasterizes layout -> TileGrid), WorldRenderer (TileGrid ->
                   Phaser Tilemap + building/prop sprites), CollisionBuilder,
                   DayLighting overlay, tileIndex (tileset strip mapping).
  assets/         PixelArtFactory (procedural texture generation), palette,
                   TextureKeys (single source of truth for texture/anim keys).
  entities/       Player, NPC, shared AnimationFactory.
  systems/        LandmarkManager, SaveManager (localStorage), AudioManager
                   (placeholder synth SFX), InteractionSystem, EventBus
                   (WorldScene <-> UIScene messaging).
  data/           landmarks.ts, npcs.ts, quests.ts — pure data, no logic.
                   This is the file to edit to add more places later.
  scenes/         BootScene -> PreloadScene (generates all art) -> TitleScene
                   -> WorldScene + UIScene (run in parallel).
  ui/             HUD, InteractionPrompt, InfoPanel, JournalUI, DialogueBox,
                   MiniMap — all driven by systems/EventBus, not tightly
                   coupled to WorldScene.
```

### Adding a new landmark

Add a `BuildingFootprint` to `src/world/cityLayout.ts` (if it needs a
building) and an entry to `src/data/landmarks.ts` referencing it — nothing
else needs touching. Adding a new neighborhood is the same shape: extend
`cityLayout.ts`'s roads/parks/buildings/props arrays; `MapBuilder` and
`WorldRenderer` don't need changes.

## Known limitations of this vertical slice

- Only a handful of pixel-art details (windows, doors, roofs) vary by
  building *kind*, not by individual real building — a deliberate
  simplification for a first playable slice.
- Audio is placeholder synth tones, not recorded foley/music (see the doc
  comment in `src/systems/AudioManager.ts` for the intended real-asset
  swap points).
- The lighting pass is a static, subtle daytime tint rather than a full
  day/night cycle, per the brief's own priority ordering.

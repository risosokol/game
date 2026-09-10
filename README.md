# TREBIŠOV: Pixel Explorer *(working title)*

A 2.5D pixel-art exploration game recreating a real, walkable slice of
**Trebišov, Slovakia**, generated from real OpenStreetMap data — its
historic civic core (Mariánske námestie with its Roman Catholic and Greek
Catholic churches, the Andrássy manor and its English park, the Koniareň
gallery, the town hall, the cultural centre, the Andrássy mausoleum, and
the Parič castle ruins), connected north along the real M. R. Štefánika
street to the railway/bus terminal. No combat: the loop is *explore →
discover a landmark → learn something real about it → it's added to your
Discovery Journal → keep exploring.*

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build     # type-checks, then builds a production bundle to dist/
npm run preview   # serve the production build locally
```

No paid APIs, no proprietary SDKs, no external asset downloads required to
run the game.

## Controls

- **WASD** / **Arrow keys** — move (8-directional)
- **Shift** — jog
- **E** — interact (discover a landmark / talk to an NPC)
- **J** / **Esc** — toggle the Discovery Journal

## What's actually implemented

- A **real street/rail/building layout** for central Trebišov: ~1,200 real
  road segments, ~2,460 real building footprints, and 2 real land-use
  polygons (the town park and cemetery), all generated from an OpenStreetMap
  Overpass export — see `data/osm/README.md` for provenance and
  `scripts/generate-city-data.mjs` for the pipeline. Rendered as a real
  Phaser Tilemap (camera-culled automatically) plus depth-sorted building
  sprites.
- 10 real, discoverable Trebišov landmarks (the Andrássy manor, its English
  park, the Koniareň gallery, the two churches on Mariánske námestie, the
  town hall, the cultural centre, the Andrássy mausoleum, the Parič castle
  ruins, and the railway/bus terminal) with descriptions grounded directly
  in their OpenStreetMap tags — denomination, historic classification,
  etc. — not invented.
- A player character with 4-direction walk/idle animation, Arcade Physics
  collision against every one of those ~2,460 real building footprints,
  and a smoothly-following camera.
- An interaction system (proximity prompt → info panel → journal entry),
  a Discovery Journal (locked/unlocked cards + 3 light exploration
  quests), a stylized minimap that mirrors the real street/park geometry,
  a few ambient NPCs with short dialogue, a placeholder audio system, a
  title screen, and a subtle daytime lighting overlay.
- Save/load via `localStorage` (discovered landmarks, quest progress,
  player position, audio settings) — progress survives a refresh.

## Why the art is "procedural placeholder" (the map geometry isn't)

This prototype was built in a sandboxed environment with no outbound
network access to image hosts, so all pixel art is placeholder:

- **Art**: every texture (tiles, buildings, player, NPCs, props, UI chrome)
  is generated at boot time from vector primitives via Phaser's
  `Graphics → generateTexture`, see `src/assets/PixelArtFactory.ts`. This
  is clearly isolated placeholder art — swapping in hand-drawn sprites
  later just means loading real images under the same keys
  (`src/assets/TextureKeys.ts`) in `PreloadScene` instead of calling the
  factory; nothing downstream changes. With ~2,460 real buildings in the
  playable area, only the 10 curated landmarks get a unique detailed
  texture — every other building reuses one texture per (kind, rounded
  size) bucket (see `src/assets/buildingTexture.ts`), at its exact real
  footprint position and (for non-curated buildings) a footprint rounded
  to the nearest couple of meters. Real geometry, generic decoration.

**The map geometry itself is real**, not invented — see the next section.

## Where the map data comes from, and how to extend it

`src/world/cityLayout.ts` and `src/data/landmarkAnchors.generated.ts` are
**auto-generated** by `scripts/generate-city-data.mjs` from a real
OpenStreetMap Overpass API export of central Trebišov (roads, railways,
building footprints, and named land-use/points-of-interest). See
`data/osm/README.md` for the exact Overpass queries, licensing (©
OpenStreetMap contributors, ODbL), and how to re-run the generator with a
wider bounding box later. Do not hand-edit those two generated files —
re-run the generator instead.

`src/geo/GeoTransform.ts` (backed by `src/geo/geoConstants.json`) is the
single seam between real-world lat/lon and the game's tile-space
coordinates — both the generator script and the runtime game share the
exact same projection, so they can never drift apart.

Hand-placed decoration (`src/world/cityProps.ts` — benches, lamps, trees)
and NPC patrol routes (`src/data/npcs.ts`) are **not** regenerated; they're
positioned relative to the generated landmark anchors so they stay sane if
the bounding box changes.

## Architecture

```
src/
  config/         Central tunables (tile size, depth layers, keys) — nothing
                   gameplay-specific is hard-coded outside this + data files.
  geo/            Lat/lon <-> tile-space transform layer, shared by the
                   runtime and scripts/generate-city-data.mjs.
  world/
    cityLayout.ts       AUTO-GENERATED real road/rail/area/building data.
    cityProps.ts        Hand-placed decoration, positioned relative to
                         real landmark anchors.
    TileGrid.ts         Tile-space grid with rect/polygon rasterization.
    MapBuilder.ts        cityLayout -> TileGrid.
    WorldRenderer.ts     TileGrid -> Phaser Tilemap + building/prop sprites.
    CollisionBuilder.ts  Building footprints -> static physics bodies.
    DayLighting.ts       Subtle screen-space lighting overlay.
    tileIndex.ts         Tileset strip <-> TileType mapping.
  assets/         PixelArtFactory (procedural texture generation),
                   buildingTexture (curated-vs-bucketed texture/footprint
                   logic for ~2,460 real buildings), palette, TextureKeys.
  entities/       Player, NPC, shared AnimationFactory.
  systems/        LandmarkManager, SaveManager (localStorage), AudioManager
                   (placeholder synth SFX), InteractionSystem, EventBus
                   (WorldScene <-> UIScene messaging).
  data/
    landmarks.ts             The 10 curated landmarks (hand-written,
                              factually grounded descriptions).
    landmarkAnchors.generated.ts   AUTO-GENERATED tile positions for them.
    npcs.ts, quests.ts        Pure data, positioned relative to landmark
                              anchors.
  scenes/         BootScene -> PreloadScene (generates all art) -> TitleScene
                   -> WorldScene + UIScene (run in parallel).
  ui/             HUD, InteractionPrompt, InfoPanel, JournalUI, DialogueBox,
                   MiniMap — all driven by systems/EventBus, not tightly
                   coupled to WorldScene.
scripts/
  generate-city-data.mjs   Overpass JSON -> cityLayout.ts + landmarkAnchors.
data/osm/
  README.md        OSM data provenance, licensing, Overpass queries.
```

### Adding a new landmark

If it's already one of the ~2,460 generated buildings: add its OSM way id
to `CURATED_BUILDING_IDS` in `scripts/generate-city-data.mjs` (so it gets a
unique texture and an anchor point) and re-run the generator, then add a
hand-written entry to `src/data/landmarks.ts` referencing the new anchor.
If it needs real geometry the current Overpass export doesn't cover,
widen the bounding box first — see `data/osm/README.md`.

## Known limitations of this vertical slice

- Building footprints are approximated as axis-aligned bounding boxes of
  their real (often slightly rotated) OSM polygon — a deliberate
  simplification; rotated footprints would need a larger architecture
  change. Non-curated buildings are additionally rounded to the nearest
  texture "bucket" size (±1 tile, ~±4m) so a handful of generic textures
  can cover ~2,450 buildings instead of generating one each.
- Only the 10 curated landmarks get individually detailed pixel art;
  every other real building uses generic per-kind decoration.
- Audio is placeholder synth tones, not recorded foley/music (see the doc
  comment in `src/systems/AudioManager.ts` for the intended real-asset
  swap points).
- The lighting pass is a static, subtle daytime tint rather than a full
  day/night cycle, per the brief's own priority ordering.

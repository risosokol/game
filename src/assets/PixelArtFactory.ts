import Phaser from 'phaser';
import { TILE_SIZE } from '@/config/GameConfig';
import { Palette } from './palette';
import { PropTextureKeys, UITextureKeys, REAL_GRASS_KEY } from './TextureKeys';
import type { BuildingFootprint } from '@/world/cityLayout';
import { TILE_ORDER, TILESET_KEY } from '@/world/tileIndex';
import { TileType } from '@/world/TileGrid';
import { COLLIDER_TEXTURE_KEY } from '@/world/CollisionBuilder';
import { textureKeyFor, effectiveFootprint } from './buildingTexture';

/**
 * PLACEHOLDER-PROGRAMMATIC ART for everything NOT covered by a real asset.
 *
 * Most textures here are still drawn at boot time with Phaser's Graphics
 * API and baked via generateTexture() — all ~2,460 real building
 * footprints, non-grass ground tiles, street furniture props, and UI
 * chrome. The player/NPC character, trees, the grass tile, the title
 * background, and the discovery sparkle are real art loaded by
 * PreloadScene instead (see its credit comment and README.md); this
 * factory just stamps the loaded grass texture into the generated tileset
 * strip (see stampRealGrassIntoTileset) and otherwise leaves those keys
 * alone. Swapping more of this placeholder art for real sprites later
 * just means loading them under the matching keys (see TextureKeys.ts) in
 * PreloadScene instead of calling the relevant generate* method here.
 */
export class PixelArtFactory {
  private scene: Phaser.Scene;
  private g: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.g = scene.add.graphics();
  }

  generateAll(buildings: BuildingFootprint[]): void {
    this.generateTiles();
    this.generateProps();
    this.generateAllBuildings(buildings);
    this.generateUI();
    this.generateCollider();
    this.g.destroy();
  }

  private tex(key: string, w: number, h: number): void {
    this.g.generateTexture(key, w, h);
    this.g.clear();
  }

  // ---------------------------------------------------------------- tiles
  /** Draws every tile type side-by-side into one strip texture so it can
   * be consumed as a Phaser tileset (addTilesetImage needs one image). */
  private generateTiles(): void {
    const T = TILE_SIZE;
    const g = this.g;

    const hasRealGrass = this.scene.textures.exists(REAL_GRASS_KEY);
    for (let i = 0; i < TILE_ORDER.length; i++) {
      const ox = i * T;
      this.drawTile(g, TILE_ORDER[i], ox, T, hasRealGrass);
    }
    const stripW = T * TILE_ORDER.length;
    const baseKey = 'tileset_proc_base';
    this.tex(baseKey, stripW, T);

    // Composite into the final TILESET_KEY via a RenderTexture — this is
    // the texture's only creation (not an overwrite of an existing key,
    // which Phaser silently refuses), so it works whether or not we're
    // stamping the real grass art on top.
    const rt = this.scene.add.renderTexture(0, 0, stripW, T).setVisible(false);
    rt.draw(baseKey, 0, 0);
    if (hasRealGrass) this.stampRealGrassIntoTileset(rt, T);
    rt.saveTexture(TILESET_KEY);
    rt.destroy();
    this.scene.textures.remove(baseKey);
  }

  /** Overlays the real grass texture (loaded by PreloadScene) onto the
   * GRASS/PARK slots of the tileset strip being composited, scaled up to
   * tile size. Everything else in the strip stays procedurally drawn. */
  private stampRealGrassIntoTileset(rt: Phaser.GameObjects.RenderTexture, T: number): void {
    const grassIndex = TILE_ORDER.indexOf(TileType.GRASS);
    const parkIndex = TILE_ORDER.indexOf(TileType.PARK);
    const stamp = this.scene.add.image(0, 0, REAL_GRASS_KEY).setOrigin(0, 0).setDisplaySize(T, T);
    rt.draw(stamp, grassIndex * T, 0);
    if (parkIndex >= 0) {
      stamp.setTint(0xcfe8b8); // slightly different shade so park still reads apart from street-side grass
      rt.draw(stamp, parkIndex * T, 0);
    }
    stamp.destroy();
  }

  private drawTile(g: Phaser.GameObjects.Graphics, type: TileType, ox: number, T: number, skipGrass: boolean): void {
    switch (type) {
      case TileType.GRASS:
        if (skipGrass) break;
        g.fillStyle(Palette.grassA).fillRect(ox, 0, T, T);
        g.fillStyle(Palette.grassB);
        for (let i = 0; i < 10; i++) g.fillRect(ox + ((i * 7) % T), (i * 13) % T, 2, 2);
        g.fillStyle(Palette.grassSpeckle);
        for (let i = 0; i < 6; i++) g.fillRect(ox + ((i * 11 + 3) % T), (i * 5 + 4) % T, 1, 3);
        break;
      case TileType.PARK:
        g.fillStyle(Palette.parkA).fillRect(ox, 0, T, T);
        g.fillStyle(Palette.parkB);
        for (let i = 0; i < 8; i++) g.fillRect(ox + ((i * 9 + 2) % T), (i * 17) % T, 3, 2);
        break;
      case TileType.ROAD:
        g.fillStyle(Palette.road).fillRect(ox, 0, T, T);
        g.fillStyle(Palette.roadEdge);
        for (let i = 0; i < 8; i++) g.fillRect(ox + ((i * 13 + 1) % T), (i * 7 + 2) % T, 2, 1);
        break;
      case TileType.PLAZA:
        g.fillStyle(Palette.plaza).fillRect(ox, 0, T, T);
        g.lineStyle(1, Palette.plazaLine, 1);
        g.strokeRect(ox + 0.5, 0.5, T / 2 - 1, T / 2 - 1);
        g.strokeRect(ox + T / 2 + 0.5, 0.5, T / 2 - 1, T / 2 - 1);
        g.strokeRect(ox + 0.5, T / 2 + 0.5, T / 2 - 1, T / 2 - 1);
        g.strokeRect(ox + T / 2 + 0.5, T / 2 + 0.5, T / 2 - 1, T / 2 - 1);
        break;
      case TileType.PATH:
        g.fillStyle(Palette.path).fillRect(ox, 0, T, T);
        g.fillStyle(Palette.pathEdge);
        for (let i = 0; i < 6; i++) g.fillRect(ox + ((i * 9 + 4) % T), (i * 15 + 2) % T, 2, 1);
        break;
      case TileType.RAIL:
        g.fillStyle(Palette.rail).fillRect(ox, 0, T, T);
        g.fillStyle(Palette.railSleeper);
        g.fillRect(ox, T / 2 - 10, T, 4);
        g.fillStyle(Palette.railTrack);
        g.fillRect(ox + T / 2 - 8, 0, 2, T);
        g.fillRect(ox + T / 2 + 6, 0, 2, T);
        break;
      case TileType.WATER:
        g.fillStyle(Palette.water).fillRect(ox, 0, T, T);
        g.fillStyle(Palette.waterHi);
        g.fillRect(ox + 4, 6, 8, 2);
        g.fillRect(ox + 18, 20, 8, 2);
        break;
    }
  }

  // --------------------------------------------------------------- player
  // Player/NPC art is a real loaded spritesheet (see PreloadScene +
  // TextureKeys.CharacterSheetKeys) — no procedural humanoid generation
  // needed any more.

  // ---------------------------------------------------------------- props
  private generateProps(): void {
    const g = this.g;

    // tree
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(16, 46, 20, 8);
    g.fillStyle(Palette.trunk).fillRect(13, 30, 6, 18);
    g.fillStyle(Palette.leafA).fillCircle(16, 20, 16);
    g.fillStyle(Palette.leafB).fillCircle(10, 16, 10);
    g.fillStyle(Palette.leafHi).fillCircle(20, 12, 6);
    this.tex(PropTextureKeys.tree, 32, 54);

    // lamp
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(6, 46, 10, 4);
    g.fillStyle(Palette.metalDark).fillRect(5, 10, 3, 36);
    g.fillStyle(Palette.metal).fillRect(2, 4, 9, 8);
    g.fillStyle(0xffe9a8).fillRect(4, 6, 5, 4);
    this.tex(PropTextureKeys.lamp, 13, 48);

    // bench
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(20, 22, 34, 6);
    g.fillStyle(Palette.trunk).fillRect(2, 8, 36, 4);
    g.fillStyle(Palette.trunk).fillRect(2, 14, 36, 4);
    g.fillStyle(Palette.metalDark).fillRect(4, 12, 3, 10);
    g.fillStyle(Palette.metalDark).fillRect(33, 12, 3, 10);
    this.tex(PropTextureKeys.bench, 40, 24);

    // bus stop shelter
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(28, 44, 50, 8);
    g.fillStyle(Palette.metalDark).fillRect(4, 6, 4, 36);
    g.fillStyle(Palette.metalDark).fillRect(48, 6, 4, 36);
    g.fillStyle(Palette.metal).fillRect(0, 0, 56, 6);
    g.fillStyle(Palette.windowGlass, 0.6).fillRect(6, 14, 44, 24);
    this.tex(PropTextureKeys.busstop, 56, 46);

    // flowerbed
    g.fillStyle(Palette.trunk).fillRoundedRect(0, 0, 32, 20, 3);
    g.fillStyle(0x6b4a2f).fillRoundedRect(3, 3, 26, 14, 2);
    const flowerColors = [0xd8536b, 0xe0a83f, 0xd85fb0, 0xffffff];
    for (let i = 0; i < 10; i++) {
      g.fillStyle(flowerColors[i % flowerColors.length]);
      g.fillCircle(5 + (i % 5) * 5, 8 + Math.floor(i / 5) * 5, 2);
    }
    this.tex(PropTextureKeys.flowerbed, 32, 20);

    // fountain
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(24, 44, 40, 8);
    g.fillStyle(Palette.stoneGray).fillCircle(24, 30, 22);
    g.fillStyle(Palette.water).fillCircle(24, 30, 17);
    g.fillStyle(Palette.stoneGray).fillCircle(24, 30, 7);
    g.fillStyle(Palette.waterHi).fillRect(22, 10, 4, 16);
    this.tex(PropTextureKeys.fountain, 48, 48);

    // sign post
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(8, 44, 10, 4);
    g.fillStyle(Palette.trunk).fillRect(6, 14, 4, 30);
    g.fillStyle(Palette.trim).fillRect(0, 0, 18, 14);
    g.lineStyle(1, Palette.windowFrame).strokeRect(0.5, 0.5, 17, 13);
    this.tex(PropTextureKeys.sign, 18, 44);

    // bike
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(16, 20, 30, 6);
    g.lineStyle(2, 0x2c2c2c);
    g.strokeCircle(6, 16, 6);
    g.strokeCircle(26, 16, 6);
    g.lineStyle(2, 0xb33a3a);
    g.lineBetween(6, 16, 16, 6);
    g.lineBetween(16, 6, 26, 16);
    g.lineBetween(16, 6, 16, 16);
    g.lineBetween(6, 16, 26, 16);
    this.tex(PropTextureKeys.bike, 32, 24);

    // car (simple top-down-ish sedan)
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(20, 40, 40, 8);
    g.fillStyle(0x3a5f8a).fillRoundedRect(0, 4, 40, 32, 6);
    g.fillStyle(Palette.windowGlass).fillRoundedRect(4, 10, 32, 12, 3);
    g.fillStyle(0x1a2a3a).fillRect(2, 6, 4, 6);
    g.fillStyle(0x1a2a3a).fillRect(2, 30, 4, 6);
    g.fillStyle(0x1a2a3a).fillRect(34, 6, 4, 6);
    g.fillStyle(0x1a2a3a).fillRect(34, 30, 4, 6);
    this.tex(PropTextureKeys.car, 40, 44);

    // noticeboard
    g.fillStyle(Palette.shadow, 0.2).fillEllipse(16, 44, 26, 5);
    g.fillStyle(Palette.trunk).fillRect(2, 10, 4, 34);
    g.fillStyle(Palette.trunk).fillRect(26, 10, 4, 34);
    g.fillStyle(Palette.roofRedDark).fillRect(0, 0, 32, 12);
    g.fillStyle(Palette.trim).fillRect(2, 12, 28, 20);
    g.fillStyle(0xffffff).fillRect(5, 15, 8, 6);
    g.fillStyle(0xffffff).fillRect(16, 20, 10, 8);
    this.tex(PropTextureKeys.noticeboard, 32, 44);

    // monument (stone column on a plinth — stands in for a memorial column)
    g.fillStyle(Palette.shadow, 0.22).fillEllipse(10, 50, 20, 6);
    g.fillStyle(Palette.stoneGray).fillRect(2, 42, 16, 8);
    g.fillStyle(this.darken(Palette.stoneGray, 0.15)).fillRect(0, 46, 20, 4);
    g.fillStyle(Palette.trim).fillRect(7, 6, 6, 36);
    g.fillStyle(this.darken(Palette.trim, 0.1)).fillRect(6, 2, 8, 6);
    g.fillStyle(0xd8c878).fillCircle(10, 4, 3);
    this.tex(PropTextureKeys.monument, 20, 52);

    // small/medium generic shadows (used under buildings as extra polish)
    g.fillStyle(Palette.shadow, 0.22).fillEllipse(16, 8, 30, 12);
    this.tex(PropTextureKeys.shadowSmall, 32, 16);
    g.fillStyle(Palette.shadow, 0.22).fillEllipse(32, 12, 60, 20);
    this.tex(PropTextureKeys.shadowMed, 64, 24);
  }

  // ------------------------------------------------------------ buildings
  /** Curated landmarks each get a unique, exact-size texture; every other
   * building (there are ~2,400 real ones in the playable area) reuses one
   * texture per (kind, rounded size) bucket — see buildingTexture.ts. */
  private generateAllBuildings(buildings: BuildingFootprint[]): void {
    const generatedKeys = new Set<string>();
    for (const b of buildings) {
      const key = textureKeyFor(b);
      if (generatedKeys.has(key)) continue;
      generatedKeys.add(key);
      const { w, h } = effectiveFootprint(b);
      this.generateBuilding(key, b.kind, w, h, !!b.roofHorizontal);
    }
  }

  private generateBuilding(key: string, kind: BuildingFootprint['kind'], wTiles: number, hTiles: number, roofHorizontal: boolean): void {
    const spec = { kind, roofHorizontal };
    const T = TILE_SIZE;
    const w = wTiles * T;
    const wallH = hTiles * T;
    const roofH = Math.round(Math.max(20, Math.min(64, hTiles * T * 0.55)));
    const H = wallH + roofH;
    const g = this.g;

    const scheme = this.schemeFor(kind);

    // ground contact shadow
    g.fillStyle(Palette.shadow, 0.22);
    g.fillEllipse(w / 2, H - 4, w * 0.9, 14);

    // walls
    g.fillStyle(scheme.wall);
    g.fillRect(0, roofH, w, wallH);
    // plinth
    g.fillStyle(this.darken(scheme.wall, 0.25));
    g.fillRect(0, H - 8, w, 8);

    // windows grid
    g.fillStyle(scheme.window);
    const winCols = Math.max(1, Math.floor(w / 24));
    const winRows = Math.max(1, Math.floor((wallH - 16) / 26));
    const winW = 10, winH = 14;
    const marginX = (w - winCols * 24) / 2 + 7;
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        const wx = marginX + c * 24;
        const wy = roofH + 12 + r * 26;
        g.fillStyle(this.darken(scheme.wall, 0.35));
        g.fillRect(wx - 2, wy - 2, winW + 4, winH + 4);
        g.fillStyle(scheme.window);
        g.fillRect(wx, wy, winW, winH);
        g.fillStyle(0xffffff, 0.25);
        g.fillRect(wx, wy, winW, 3);
      }
    }

    // door
    g.fillStyle(Palette.doorBrown);
    const doorW = 14;
    g.fillRect(w / 2 - doorW / 2, H - 26, doorW, 26);
    g.fillStyle(0x3a2818);
    g.fillRect(w / 2 - doorW / 2, H - 26, doorW, 4);

    // roof
    this.drawRoof(g, spec, w, roofH, scheme);

    // kind-specific accents
    this.drawAccent(g, spec, w, roofH, wallH, scheme);

    this.tex(key, w, H);
  }

  private drawRoof(g: Phaser.GameObjects.Graphics, b: BuildingSpec, w: number, roofH: number, scheme: BuildingScheme): void {
    if (b.kind === 'ruins') {
      // no roof at all — the jagged broken wall tops (drawAccent) read as
      // the silhouette instead.
      return;
    }
    if (b.kind === 'synagogue') {
      // domed hint: rounded roof
      g.fillStyle(scheme.roof);
      g.fillRect(0, roofH * 0.4, w, roofH * 0.6);
      g.fillStyle(this.darken(scheme.roof, 0.15));
      g.fillEllipse(w / 2, roofH * 0.4, w * 0.9, roofH * 0.8);
      g.fillStyle(this.lighten(scheme.roof, 0.2));
      g.fillEllipse(w / 2, roofH * 0.25, w * 0.5, roofH * 0.5);
      return;
    }
    // classic gable/hip roof silhouette (trapezoid) — reads well from a
    // 3/4-top-down angle without needing true isometric geometry.
    g.fillStyle(scheme.roof);
    g.fillTriangle(0, roofH, w, roofH, w * 0.5, 0);
    g.fillStyle(this.darken(scheme.roof, 0.18));
    g.fillTriangle(w * 0.5, 0, w, roofH, w * 0.72, roofH);
    if (b.roofHorizontal) {
      g.fillStyle(this.lighten(scheme.roof, 0.12));
      g.fillRect(0, roofH - 6, w, 6);
    }
    // ridge line
    g.lineStyle(1, this.darken(scheme.roof, 0.3), 0.7);
    g.lineBetween(w * 0.5, 0, w * 0.5, roofH * 0.15);
  }

  private drawAccent(g: Phaser.GameObjects.Graphics, b: BuildingSpec, w: number, roofH: number, wallH: number, scheme: BuildingScheme): void {
    switch (b.kind) {
      case 'church':
      case 'chapel': {
        g.fillStyle(this.darken(scheme.roof, 0.1));
        g.fillRect(w / 2 - 3, -18, 6, 20);
        g.fillRect(w / 2 - 9, -12, 18, 5);
        break;
      }
      case 'mausoleum': {
        // small stone urn/finial on the ridge, plus a dark doorway arch
        g.fillStyle(this.darken(scheme.roof, 0.2));
        g.fillCircle(w / 2, roofH * 0.18, 6);
        g.fillStyle(Palette.trim);
        for (let x = 6; x < w - 6; x += 16) g.fillRect(x, roofH + wallH - 34, 4, 34);
        break;
      }
      case 'ruins': {
        // broken, uneven wall tops instead of a clean roofline
        g.fillStyle(this.darken(scheme.wall, 0.3));
        for (let x = 0; x < w; x += 10) {
          const jag = 4 + ((x * 7) % 11);
          g.fillRect(x, roofH - jag, 9, jag);
        }
        break;
      }
      case 'manor': {
        // colonnade hint along the base
        g.fillStyle(Palette.trim);
        for (let x = 8; x < w - 8; x += 18) g.fillRect(x, roofH + wallH - 30, 5, 30);
        g.fillStyle(Palette.trim, 0.9);
        g.fillRect(0, roofH - 2, w, 4);
        break;
      }
      case 'townhall': {
        g.fillStyle(0xffffff);
        g.fillCircle(w / 2, roofH * 0.5, 8);
        g.fillStyle(this.darken(scheme.roof, 0.4));
        g.fillRect(w / 2 - 1, roofH * 0.5, 1, 5);
        g.fillRect(w / 2, roofH * 0.5 - 4, 4, 1);
        break;
      }
      case 'station': {
        g.fillStyle(Palette.trim);
        g.fillRect(0, roofH - 4, w, 4);
        g.fillStyle(this.darken(scheme.roof, 0.2));
        for (let x = 6; x < w; x += 20) g.fillRect(x, roofH, 3, 18);
        break;
      }
      case 'culturehouse': {
        g.fillStyle(0xb33a3a);
        g.fillRect(w * 0.15, roofH + 4, 6, 22);
        break;
      }
      case 'shop': {
        g.fillStyle(0xb33a3a);
        for (let x = 4; x < w - 4; x += 10) g.fillTriangle(x, roofH + 4, x + 5, roofH + 4, x + 2.5, roofH + 12);
        break;
      }
    }
  }

  private schemeFor(kind: BuildingFootprint['kind']): BuildingScheme {
    switch (kind) {
      case 'manor': return { wall: Palette.wallOchre, roof: Palette.roofRed, window: Palette.windowGlass };
      case 'church': return { wall: Palette.wallWhite, roof: Palette.roofSlate, window: Palette.windowGlass };
      case 'chapel': return { wall: Palette.wallWhite, roof: Palette.roofSlate, window: Palette.windowGlass };
      case 'townhall': return { wall: Palette.wallStone, roof: Palette.roofSlate, window: Palette.windowGlass };
      case 'synagogue': return { wall: Palette.wallCream, roof: Palette.roofCopper, window: Palette.windowGlass };
      case 'culturehouse': return { wall: Palette.wallStone, roof: Palette.roofSlateDark, window: Palette.windowGlass };
      case 'station': return { wall: Palette.wallCream, roof: Palette.roofRedDark, window: Palette.windowGlass };
      case 'shop': return { wall: Palette.wallCream, roof: Palette.roofRed, window: Palette.windowGlass };
      case 'mausoleum': return { wall: Palette.wallStone, roof: Palette.roofSlateDark, window: Palette.windowGlass };
      case 'ruins': return { wall: Palette.stoneGray, roof: Palette.stoneGray, window: Palette.windowGlass };
      case 'house':
      default: return { wall: Palette.wallCream, roof: Palette.roofRed, window: Palette.windowGlass };
    }
  }

  private darken(color: number, amt: number): number {
    return Phaser.Display.Color.ValueToColor(color).clone().darken(amt * 100).color;
  }
  private lighten(color: number, amt: number): number {
    return Phaser.Display.Color.ValueToColor(color).clone().brighten(amt * 100).color;
  }

  // -------------------------------------------------------------------- UI
  private generateUI(): void {
    const g = this.g;

    // cursor (small pixel arrow)
    g.fillStyle(0xffffff);
    g.fillTriangle(0, 0, 0, 14, 10, 10);
    g.lineStyle(1, 0x000000, 0.6);
    g.strokeTriangle(0, 0, 0, 14, 10, 10);
    this.tex(UITextureKeys.cursor, 12, 16);

    // interaction prompt icon (a soft glowing dot / "E")
    g.fillStyle(0x1c1c22, 0.85);
    g.fillRoundedRect(0, 0, 20, 20, 5);
    g.lineStyle(1, 0xf0e6c8, 0.9);
    g.strokeRoundedRect(0.5, 0.5, 19, 19, 5);
    this.tex(UITextureKeys.interactIcon, 20, 20);

    // journal icon (little book)
    g.fillStyle(0x8a5a2f);
    g.fillRoundedRect(0, 0, 20, 16, 2);
    g.fillStyle(0xf0e6c8);
    g.fillRect(2, 2, 16, 12);
    g.lineStyle(1, 0x8a5a2f);
    g.lineBetween(10, 2, 10, 14);
    this.tex(UITextureKeys.journalIcon, 20, 16);

    // 9-slice-ish panel background (flat with border, scaled by UI code)
    g.fillStyle(0x171a21, 0.92);
    g.fillRoundedRect(0, 0, 64, 64, 8);
    g.lineStyle(2, 0xf0e6c8, 0.6);
    g.strokeRoundedRect(1, 1, 62, 62, 8);
    this.tex(UITextureKeys.panel, 64, 64);
  }

  private generateCollider(): void {
    this.g.fillStyle(0xffffff, 1).fillRect(0, 0, 1, 1);
    this.tex(COLLIDER_TEXTURE_KEY, 1, 1);
  }
}

interface BuildingScheme {
  wall: number;
  roof: number;
  window: number;
}

interface BuildingSpec {
  kind: BuildingFootprint['kind'];
  roofHorizontal?: boolean;
}

import Phaser from 'phaser';
import { SCENE_KEYS, TILE_SIZE } from '@/config/GameConfig';
import { buildTileGrid } from '@/world/MapBuilder';
import { renderTileLayer, renderBuildings, renderProps } from '@/world/WorldRenderer';
import { buildCollisionGroup } from '@/world/CollisionBuilder';
import { GRID_WIDTH, GRID_HEIGHT } from '@/world/cityLayout';
import { Player } from '@/entities/Player';
import { NPC } from '@/entities/NPC';
import { npcDefinitions } from '@/data/npcs';
import { landmarks } from '@/data/landmarks';
import { createAllAnimations } from '@/entities/AnimationFactory';
import { InteractionSystem } from '@/systems/InteractionSystem';
import { saveManager } from '@/systems/SaveManager';
import { EventBus, GameEvents } from '@/systems/EventBus';
import { audioManager } from '@/systems/AudioManager';
import { addDayLightingOverlay } from '@/world/DayLighting';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private interaction!: InteractionSystem;
  private saveTimer = 0;

  constructor() {
    super(SCENE_KEYS.WORLD);
  }

  create(): void {
    createAllAnimations(this);

    const grid = buildTileGrid();
    const { map } = renderTileLayer(this, grid);
    renderBuildings(this);
    renderProps(this);
    const collisionGroup = buildCollisionGroup(this);

    const worldWidth = GRID_WIDTH * TILE_SIZE;
    const worldHeight = GRID_HEIGHT * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    const savedPos = saveManager.getPlayerPosition();
    const spawnX = (savedPos?.tileX ?? 70) * TILE_SIZE;
    const spawnY = (savedPos?.tileY ?? 60) * TILE_SIZE;
    this.player = new Player(this, spawnX, spawnY);
    this.physics.add.collider(this.player, collisionGroup);

    this.npcs = npcDefinitions.map((def) => new NPC(this, def));
    for (const npc of this.npcs) {
      this.physics.add.collider(npc, collisionGroup);
      this.physics.add.collider(this.player, npc);
    }

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.4);

    this.interaction = new InteractionSystem(this, landmarks, this.npcs);
    addDayLightingOverlay(this);

    this.input.keyboard!.on('keydown', () => audioManager.unlock());
    this.input.once('pointerdown', () => audioManager.unlock());

    EventBus.emit(GameEvents.PLAYER_TILE_MOVED, this.player.getTilePosition(TILE_SIZE));

    void map; // tilemap kept alive via layer; reference retained for future expansion (e.g. debug overlays)
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    for (const npc of this.npcs) npc.update(delta);
    this.interaction.update(this.player.x, this.player.y);

    this.saveTimer += delta;
    if (this.saveTimer > 1500) {
      this.saveTimer = 0;
      const tile = this.player.getTilePosition(TILE_SIZE);
      saveManager.savePlayerPosition(tile.x, tile.y);
      EventBus.emit(GameEvents.PLAYER_TILE_MOVED, tile);
    }
  }
}

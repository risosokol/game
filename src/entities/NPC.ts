import Phaser from 'phaser';
import { TILE_SIZE, DEPTH } from '@/config/GameConfig';
import { npcAnimKey } from './AnimationFactory';
import { NpcDefinition } from '@/data/npcs';
import { CharacterSheetKeys, NPC_TINTS } from '@/assets/TextureKeys';

const WAIT_MS = 1800;
const NPC_SPEED = 45;

export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly definition: NpcDefinition;
  private waypointIndex = 0;
  private waitTimer = 0;
  private shadow: Phaser.GameObjects.Ellipse;
  private dialogueIndex = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';

  constructor(scene: Phaser.Scene, def: NpcDefinition) {
    const start = def.patrol[0];
    super(scene, start.x * TILE_SIZE, start.y * TILE_SIZE, CharacterSheetKeys.sheet('down'), 0);
    this.definition = def;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.9);
    this.setDepth(this.y);
    this.setTint(NPC_TINTS[def.paletteId]);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 12);
    body.setOffset(8, 34);
    body.setImmovable(true);

    this.shadow = scene.add.ellipse(this.x, this.y, 16, 6, 0x000000, 0.22);
    this.shadow.setDepth(DEPTH.SHADOW);

    this.play(npcAnimKey(def.paletteId, 'idle', 'down'));
  }

  /** Returns the next line of dialogue, cycling through the NPC's list. */
  nextDialogueLine(): string {
    const line = this.definition.dialogue[this.dialogueIndex % this.definition.dialogue.length];
    this.dialogueIndex++;
    return line;
  }

  update(delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const patrol = this.definition.patrol;
    if (patrol.length < 2) {
      body.setVelocity(0, 0);
      this.shadow.setPosition(this.x, this.y + 2);
      this.setDepth(this.y);
      return;
    }

    const target = patrol[this.waypointIndex];
    const tx = target.x * TILE_SIZE;
    const ty = target.y * TILE_SIZE;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 3) {
      body.setVelocity(0, 0);
      this.waitTimer += delta;
      this.playIdle();
      if (this.waitTimer > WAIT_MS) {
        this.waitTimer = 0;
        this.waypointIndex = (this.waypointIndex + 1) % patrol.length;
      }
    } else {
      const vx = (dx / dist) * NPC_SPEED;
      const vy = (dy / dist) * NPC_SPEED;
      body.setVelocity(vx, vy);
      this.playWalk(vx, vy);
    }

    this.shadow.setPosition(this.x, this.y + 2);
    this.setDepth(this.y);
  }

  private playIdle(): void {
    const key = npcAnimKey(this.definition.paletteId, 'idle', this.facing);
    if (this.anims.currentAnim?.key !== key) this.play(key, true);
  }

  private playWalk(vx: number, vy: number): void {
    if (Math.abs(vx) > Math.abs(vy)) {
      this.facing = vx > 0 ? 'right' : 'left';
    } else {
      this.facing = vy > 0 ? 'down' : 'up';
    }
    const key = npcAnimKey(this.definition.paletteId, 'walk', this.facing);
    if (this.anims.currentAnim?.key !== key) this.play(key, true);
  }
}

import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_RUN_SPEED, DEPTH } from '@/config/GameConfig';
import { playerAnimKey } from './AnimationFactory';
import { audioManager } from '@/systems/AudioManager';

type Facing = 'down' | 'up' | 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyShift: Phaser.Input.Keyboard.Key;
  private facing: Facing = 'down';
  private moving = false;
  private stepAccum = 0;
  private shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle_down');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.9);
    this.setDepth(DEPTH.PLAYER);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 10);
    body.setOffset(5, 34);
    body.setCollideWorldBounds(true);

    this.shadow = scene.add.ellipse(x, y, 16, 6, 0x000000, 0.25);
    this.shadow.setDepth(DEPTH.SHADOW);

    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyShift = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.play(playerAnimKey('idle', 'down'));
  }

  update(delta: number): void {
    const left = this.cursors.left?.isDown || this.keyA.isDown;
    const right = this.cursors.right?.isDown || this.keyD.isDown;
    const up = this.cursors.up?.isDown || this.keyW.isDown;
    const down = this.cursors.down?.isDown || this.keyS.isDown;
    const running = this.keyShift.isDown;

    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    this.moving = vx !== 0 || vy !== 0;

    if (this.moving) {
      const len = Math.hypot(vx, vy) || 1;
      const speed = running ? PLAYER_RUN_SPEED : PLAYER_SPEED;
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;

      // 4-direction facing chosen from the dominant axis, so diagonal
      // movement still reads clearly while keeping a small, clean anim set.
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }

      this.stepAccum += delta;
      if (this.stepAccum > 260) {
        this.stepAccum = 0;
        audioManager.playFootstep();
      }
    } else {
      this.stepAccum = 0;
    }

    (this.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);

    this.applyAnimation();

    this.shadow.setPosition(this.x, this.y + 2);
    this.setDepth(this.y);
  }

  private applyAnimation(): void {
    const dirKey = this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing;
    this.setFlipX(this.facing === 'left');
    const key = playerAnimKey(this.moving ? 'walk' : 'idle', dirKey);
    if (this.anims.currentAnim?.key !== key) {
      this.play(key, true);
    }
  }

  getTilePosition(tileSize: number): { x: number; y: number } {
    return { x: this.x / tileSize, y: this.y / tileSize };
  }
}

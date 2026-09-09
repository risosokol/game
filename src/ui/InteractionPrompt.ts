import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { EventBus, GameEvents, InteractionTarget } from '@/systems/EventBus';
import { UITextureKeys } from '@/assets/TextureKeys';

/** Subtle floating "Press E" indicator, shown whenever the player is near
 * something they can interact with. */
export class InteractionPrompt {
  private container: Phaser.GameObjects.Container;
  private icon: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.icon = scene.add.image(0, 0, UITextureKeys.interactIcon).setOrigin(0.5);
    this.label = scene.add.text(16, -9, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#f0e6c8',
    }).setOrigin(0, 0.5);

    const width = 200;
    this.bg = scene.add.rectangle(90, 0, width, 28, 0x171a21, 0).setOrigin(0.5);

    this.container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 90, [this.icon, this.label]);
    this.container.setDepth(DEPTH.UI);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
    this.container.setAlpha(0);
    void this.bg;

    EventBus.on(GameEvents.INTERACTION_AVAILABLE, this.onAvailable, this);
    EventBus.on(GameEvents.INTERACTION_UNAVAILABLE, this.onUnavailable, this);
  }

  private onAvailable(target: InteractionTarget): void {
    const verb = target.kind === 'landmark' ? 'Discover' : 'Talk to';
    this.label.setText(`Press E — ${verb} ${target.name}`);
    if (!this.container.visible) {
      this.container.setVisible(true);
      this.container.setScale(0.9);
      this.container.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        scale: 1,
        duration: 160,
        ease: 'Back.Out',
      });
    }
  }

  private onUnavailable(): void {
    this.container.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 120,
      onComplete: () => this.container.setVisible(false),
    });
  }

  destroy(): void {
    EventBus.off(GameEvents.INTERACTION_AVAILABLE, this.onAvailable, this);
    EventBus.off(GameEvents.INTERACTION_UNAVAILABLE, this.onUnavailable, this);
    this.container.destroy();
  }
}

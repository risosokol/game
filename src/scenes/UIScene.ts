import Phaser from 'phaser';
import { SCENE_KEYS, GAME_HEIGHT } from '@/config/GameConfig';
import { HUD } from '@/ui/HUD';
import { InteractionPrompt } from '@/ui/InteractionPrompt';
import { InfoPanel } from '@/ui/InfoPanel';
import { DialogueBox } from '@/ui/DialogueBox';
import { JournalUI } from '@/ui/JournalUI';
import { MiniMap } from '@/ui/MiniMap';

export class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.UI);
  }

  create(): void {
    new HUD(this);
    new MiniMap(this);
    new InteractionPrompt(this);
    new InfoPanel(this);
    new DialogueBox(this);
    new JournalUI(this);

    const hint = this.add.text(18, GAME_HEIGHT - 34, 'WASD / Arrows to move   ·   Shift to jog   ·   E to interact   ·   J for journal', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8a8570',
    });
    hint.setScrollFactor(0);
    this.tweens.add({ targets: hint, alpha: 0, delay: 6000, duration: 1200 });
  }
}

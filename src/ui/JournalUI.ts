import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { landmarkManager } from '@/systems/LandmarkManager';
import { EventBus, GameEvents } from '@/systems/EventBus';
import { audioManager } from '@/systems/AudioManager';
import { Landmark } from '@/data/landmarks';
import { questDefinitions } from '@/data/quests';
import { saveManager } from '@/systems/SaveManager';

const PANEL_W = 920;
const PANEL_H = 630;
const CARD_W = 270;
const CARD_H = 118;
const COLS = 3;
const GAP = 14;
const CARDS_TOP = 96;
const CARDS_ROWS = 3; // Math.ceil(landmarks.length / COLS), fixed for the 9-landmark slice
const QUESTS_TOP = CARDS_TOP + CARDS_ROWS * (CARD_H + GAP) + 10;

const CATEGORY_COLOR: Record<Landmark['category'], number> = {
  heritage: 0xc9a34a,
  religious: 0x8aa0c9,
  civic: 0xb08a5a,
  nature: 0x6fae5a,
  transport: 0xaa6f6f,
};

export class JournalUI {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private open = false;
  private toggleKey: Phaser.Input.Keyboard.Key;
  private closeKey: Phaser.Input.Keyboard.Key;
  private cardsLayer: Phaser.GameObjects.Container;
  private questLayer: Phaser.GameObjects.Container;
  private countText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const dim = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060a, 0.72).setOrigin(0);

    const px = GAME_WIDTH / 2 - PANEL_W / 2;
    const py = GAME_HEIGHT / 2 - PANEL_H / 2;
    const bg = scene.add.graphics();
    bg.fillStyle(0x14161c, 0.97);
    bg.fillRoundedRect(px, py, PANEL_W, PANEL_H, 14);
    bg.lineStyle(2, 0xf0e6c8, 0.55);
    bg.strokeRoundedRect(px + 1, py + 1, PANEL_W - 2, PANEL_H - 2, 14);

    const title = scene.add.text(px + 28, py + 22, 'Discovery Journal', {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#f0e6c8', fontStyle: 'bold',
    });
    this.countText = scene.add.text(px + 28, py + 58, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#8fae5f',
    });
    const closeHint = scene.add.text(px + PANEL_W - 28, py + 26, 'J / Esc to close', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#8a8570',
    }).setOrigin(1, 0);

    this.cardsLayer = scene.add.container(px + 28, py + CARDS_TOP);
    this.questLayer = scene.add.container(px + 28, py + QUESTS_TOP);

    const questTitle = scene.add.text(0, 0, 'Exploration Quests', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#c9bfa0', fontStyle: 'bold',
    });
    this.questLayer.add(questTitle);

    this.root = scene.add.container(0, 0, [dim, bg, title, this.countText, closeHint, this.cardsLayer, this.questLayer]);
    this.root.setDepth(DEPTH.UI + 20);
    this.root.setScrollFactor(0);
    this.root.setVisible(false);

    this.toggleKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.closeKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    EventBus.on(GameEvents.JOURNAL_TOGGLE, () => this.toggle());
    EventBus.on(GameEvents.LANDMARK_DISCOVERED, () => {
      if (this.open) this.rebuild();
    });

    scene.events.on('update', () => {
      if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) this.toggle();
      if (this.open && Phaser.Input.Keyboard.JustDown(this.closeKey)) this.toggle();
    });
  }

  private toggle(): void {
    this.open = !this.open;
    this.root.setVisible(this.open);
    if (this.open) {
      audioManager.playUiClick();
      this.rebuild();
    }
  }

  private rebuild(): void {
    this.cardsLayer.removeAll(true);
    this.questLayer.removeAll(true);

    const landmarks = landmarkManager.getAll();
    this.countText.setText(`${landmarkManager.discoveredCount()} / ${landmarkManager.totalCount()} locations discovered`);

    landmarks.forEach((lm, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * (CARD_W + GAP);
      const y = row * (CARD_H + GAP);
      this.cardsLayer.add(this.buildCard(lm, x, y));
    });

    const questTitle = this.scene.add.text(0, 0, 'Exploration Quests', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#c9bfa0', fontStyle: 'bold',
    });
    this.questLayer.add(questTitle);

    questDefinitions.forEach((q, i) => {
      const done = saveManager.isQuestCompleted(q.id);
      const doneCount = q.requiredLandmarks.filter((id) => landmarkManager.isDiscovered(id)).length;
      const text = this.scene.add.text(0, 24 + i * 20,
        `${done ? '✓' : '○'} ${q.title} — ${q.description} (${doneCount}/${q.requiredLandmarks.length})`, {
          fontFamily: 'Georgia, serif', fontSize: '13px',
          color: done ? '#8fae5f' : '#c9bfa0',
        });
      this.questLayer.add(text);
    });
  }

  private buildCard(lm: Landmark, x: number, y: number): Phaser.GameObjects.Container {
    const discovered = landmarkManager.isDiscovered(lm.id);
    const g = this.scene.add.graphics();
    g.fillStyle(discovered ? 0x1c1f27 : 0x111318, 1);
    g.fillRoundedRect(0, 0, CARD_W, CARD_H, 8);
    g.lineStyle(2, discovered ? CATEGORY_COLOR[lm.category] : 0x3a3a40, 0.9);
    g.strokeRoundedRect(1, 1, CARD_W - 2, CARD_H - 2, 8);

    const items: Phaser.GameObjects.GameObject[] = [g];

    if (discovered) {
      const dot = this.scene.add.circle(16, 18, 5, CATEGORY_COLOR[lm.category]);
      const name = this.scene.add.text(28, 10, lm.name, {
        fontFamily: 'Georgia, serif', fontSize: '15px', color: '#f0e6c8', fontStyle: 'bold',
        wordWrap: { width: CARD_W - 40 },
      });
      const desc = this.scene.add.text(14, 52, lm.shortDescription, {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9bfa0',
        wordWrap: { width: CARD_W - 28 }, lineSpacing: 3,
      });
      items.push(dot, name, desc);
    } else {
      const q = this.scene.add.text(CARD_W / 2, CARD_H / 2 - 14, '?', {
        fontFamily: 'Georgia, serif', fontSize: '36px', color: '#3a3a40', fontStyle: 'bold',
      }).setOrigin(0.5);
      const label = this.scene.add.text(CARD_W / 2, CARD_H / 2 + 30, 'Undiscovered', {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#55555c',
      }).setOrigin(0.5);
      items.push(q, label);
    }

    return this.scene.add.container(x, y, items);
  }
}

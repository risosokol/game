import Phaser from 'phaser';
import { DEPTH } from '@/config/GameConfig';
import { UITextureKeys } from '@/assets/TextureKeys';
import { landmarkManager } from '@/systems/LandmarkManager';
import { EventBus, GameEvents } from '@/systems/EventBus';
import { audioManager } from '@/systems/AudioManager';

/** Top-left HUD: a journal button with live discovery count, and a mute
 * toggle. Minimal by design — exploration should read as calm, not busy. */
export class HUD {
  constructor(scene: Phaser.Scene) {
    const container = scene.add.container(18, 18);
    container.setDepth(DEPTH.UI);
    container.setScrollFactor(0);

    const bg = scene.add.graphics();
    bg.fillStyle(0x14161c, 0.82);
    bg.fillRoundedRect(0, 0, 168, 46, 8);
    bg.lineStyle(1.5, 0xf0e6c8, 0.4);
    bg.strokeRoundedRect(0.5, 0.5, 167, 45, 8);

    const icon = scene.add.image(24, 23, UITextureKeys.journalIcon).setScale(1.1);
    const countText = scene.add.text(44, 10, '', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#f0e6c8', fontStyle: 'bold',
    });
    const subText = scene.add.text(44, 26, 'Journal (J)', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8a8570',
    });

    const muteBtn = scene.add.text(140, 14, '♪', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#8fae5f',
    }).setInteractive({ useHandCursor: true });

    const updateCount = () => {
      countText.setText(`${landmarkManager.discoveredCount()} / ${landmarkManager.totalCount()} found`);
    };
    updateCount();
    EventBus.on(GameEvents.LANDMARK_DISCOVERED, updateCount);

    const updateMuteVisual = () => {
      muteBtn.setColor(audioManager.sfxEnabled ? '#8fae5f' : '#5a5a5a');
    };
    updateMuteVisual();
    muteBtn.on('pointerdown', () => {
      audioManager.unlock();
      audioManager.setSfxEnabled(!audioManager.sfxEnabled);
      audioManager.setMusicEnabled(audioManager.sfxEnabled);
      updateMuteVisual();
      audioManager.playUiClick();
    });

    const hitArea = scene.add.zone(0, 0, 128, 46).setOrigin(0).setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => {
      audioManager.unlock();
      EventBus.emit(GameEvents.JOURNAL_TOGGLE);
    });

    container.add([bg, icon, countText, subText, muteBtn, hitArea]);
  }
}

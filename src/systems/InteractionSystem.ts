import Phaser from 'phaser';
import { TILE_SIZE, INTERACTION_RADIUS_TILES } from '@/config/GameConfig';
import { Landmark } from '@/data/landmarks';
import { landmarkManager } from './LandmarkManager';
import { EventBus, GameEvents, InteractionTarget } from './EventBus';
import { audioManager } from './AudioManager';
import { NPC } from '@/entities/NPC';

/** Finds the closest interactable (landmark or NPC) within range of the
 * player each frame, and reacts to the interact key. This is the single
 * source of truth for "what does pressing E do right now". */
export class InteractionSystem {
  private scene: Phaser.Scene;
  private landmarks: Landmark[];
  private npcs: NPC[];
  private interactKey: Phaser.Input.Keyboard.Key;
  private current: InteractionTarget | null = null;
  private lastAnnounced = false;

  constructor(scene: Phaser.Scene, landmarks: Landmark[], npcs: NPC[]) {
    this.scene = scene;
    this.landmarks = landmarks;
    this.npcs = npcs;
    this.interactKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update(playerX: number, playerY: number): void {
    const radiusPx = INTERACTION_RADIUS_TILES * TILE_SIZE;
    let best: { target: InteractionTarget; dist: number } | null = null;

    for (const lm of this.landmarks) {
      const dx = lm.tileX * TILE_SIZE - playerX;
      const dy = lm.tileY * TILE_SIZE - playerY;
      const dist = Math.hypot(dx, dy);
      if (dist <= radiusPx && (!best || dist < best.dist)) {
        best = { target: { kind: 'landmark', id: lm.id, name: lm.name }, dist };
      }
    }
    for (const npc of this.npcs) {
      const dx = npc.x - playerX;
      const dy = npc.y - playerY;
      const dist = Math.hypot(dx, dy);
      if (dist <= radiusPx && (!best || dist < best.dist)) {
        best = { target: { kind: 'npc', id: npc.definition.id, name: npc.definition.name }, dist };
      }
    }

    this.current = best?.target ?? null;

    if (this.current && !this.lastAnnounced) {
      this.lastAnnounced = true;
      audioManager.playInteractAvailable();
      EventBus.emit(GameEvents.INTERACTION_AVAILABLE, this.current);
    } else if (!this.current && this.lastAnnounced) {
      this.lastAnnounced = false;
      EventBus.emit(GameEvents.INTERACTION_UNAVAILABLE);
    } else if (this.current && this.lastAnnounced) {
      // target may have changed (e.g. player walked from one to another
      // without leaving range) — re-announce so the HUD label updates.
      EventBus.emit(GameEvents.INTERACTION_AVAILABLE, this.current);
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.current) {
      this.trigger(this.current);
    }
  }

  private trigger(target: InteractionTarget): void {
    if (target.kind === 'landmark') {
      const landmark = this.landmarks.find((l) => l.id === target.id);
      if (!landmark) return;
      const wasNew = !landmarkManager.isDiscovered(landmark.id);
      landmarkManager.discover(landmark.id);
      if (wasNew) audioManager.playDiscovery();
      EventBus.emit(GameEvents.LANDMARK_DISCOVERED, landmark, wasNew);
    } else {
      const npc = this.npcs.find((n) => n.definition.id === target.id);
      if (!npc) return;
      EventBus.emit(GameEvents.DIALOGUE_OPENED, npc.definition, npc.nextDialogueLine());
    }
  }
}

import Phaser from 'phaser';
import { landmarks, Landmark } from '@/data/landmarks';
import { saveManager } from './SaveManager';
import { questDefinitions } from '@/data/quests';

export const LandmarkEvents = {
  DISCOVERED: 'landmark-discovered',
  QUEST_COMPLETED: 'quest-completed',
} as const;

/** Tracks discovery state for all landmarks and exposes it as a small
 * event emitter so UI (journal, HUD, minimap) can react without polling. */
export class LandmarkManager extends Phaser.Events.EventEmitter {
  private discovered = new Set<string>(saveManager.getData().discoveredLandmarks);

  getAll(): Landmark[] {
    return landmarks;
  }

  isDiscovered(id: string): boolean {
    return this.discovered.has(id);
  }

  discoveredCount(): number {
    return this.discovered.size;
  }

  totalCount(): number {
    return landmarks.length;
  }

  discover(id: string): void {
    if (this.discovered.has(id)) return;
    const landmark = landmarks.find((l) => l.id === id);
    if (!landmark) return;
    this.discovered.add(id);
    saveManager.markDiscovered(id);
    this.emit(LandmarkEvents.DISCOVERED, landmark);
    this.checkQuests();
  }

  private checkQuests(): void {
    for (const quest of questDefinitions) {
      if (saveManager.isQuestCompleted(quest.id)) continue;
      const done = quest.requiredLandmarks.every((id) => this.discovered.has(id));
      if (done) {
        saveManager.markQuestCompleted(quest.id);
        this.emit(LandmarkEvents.QUEST_COMPLETED, quest);
      }
    }
  }
}

export const landmarkManager = new LandmarkManager();

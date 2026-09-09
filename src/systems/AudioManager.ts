import { saveManager } from './SaveManager';

/**
 * PLACEHOLDER AUDIO SYSTEM.
 *
 * No binary audio assets ship with this prototype. Instead this manager
 * synthesizes short placeholder tones via the WebAudio API for UI and
 * interaction feedback, and exposes named "channels" (footstep, ambience,
 * bird, wind, interact, ui, music) that a future pass can wire up to real
 * .ogg/.mp3 files by simply loading them under the same keys in
 * PreloadScene and replacing the synth calls below with
 * `scene.sound.play(key)`. The mute/volume plumbing (settings, toggle)
 * is already fully functional so that swap is the only thing left to do.
 */
class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  private ensureContext(): AudioContext | null {
    if (!this.unlocked) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  /** Must be called from a user gesture (click/keydown) to satisfy
   * browser autoplay policies. Safe to call repeatedly. */
  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ensureContext();
  }

  get sfxEnabled(): boolean {
    return saveManager.getSettings().sfxEnabled;
  }

  get musicEnabled(): boolean {
    return saveManager.getSettings().musicEnabled;
  }

  setSfxEnabled(v: boolean): void {
    saveManager.setSetting('sfxEnabled', v);
  }

  setMusicEnabled(v: boolean): void {
    saveManager.setSetting('musicEnabled', v);
  }

  private tone(freq: number, durationMs: number, type: OscillatorType = 'sine', gainPeak = 0.05): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
  }

  /** Soft UI click, e.g. opening the journal or a button hover. */
  playUiClick(): void {
    this.tone(660, 60, 'triangle', 0.04);
  }

  /** Landmark discovery / positive confirmation chime. */
  playDiscovery(): void {
    this.tone(523, 90, 'sine', 0.06);
    setTimeout(() => this.tone(784, 140, 'sine', 0.06), 90);
  }

  /** Interaction prompt "ready" blip. */
  playInteractAvailable(): void {
    this.tone(440, 40, 'square', 0.02);
  }

  /** Single footstep — extremely light so it can be called every step
   * without becoming annoying; real footstep foley would replace this. */
  playFootstep(): void {
    this.tone(120, 35, 'triangle', 0.015);
  }

  /** Called once per short interval by ambient loop hooks (birds/wind);
   * currently a no-op placeholder that documents the intended channel. */
  playAmbienceTick(_channel: 'bird' | 'wind' | 'city' | 'park'): void {
    // Intentionally silent placeholder — see class doc comment.
  }
}

export const audioManager = new AudioManagerImpl();

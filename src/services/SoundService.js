export const SOUND_KEY = 'www-of-anime:sound:v1';
const tones = { reveal: [330, 440], correct: [523, 784], wrong: [220, 165], round: [440, 659], victory: [523, 659, 784] };
// Generated tones only. Never create an audio context until an opted-in gesture.
export class LocalSoundService {
  constructor({ getStorage = () => globalThis.localStorage, createAudio = () => {
    const Audio = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!Audio) throw new Error('Sound is unavailable in this browser.');
    return new Audio();
  }, isHidden = () => globalThis.document?.hidden } = {}) {
    this.getStorage = getStorage; this.createAudio = createAudio; this.isHidden = isHidden;
    this.audio = null; this.sources = new Set(); this.generation = 0; this.override = null;
  }
  enabled() { if (this.override !== null) return this.override; try { return this.getStorage().getItem(SOUND_KEY) === 'on'; } catch { return false; } }
  sync() { this.override = null; const enabled = this.enabled(); if (!enabled) this.stop(); return enabled; }
  setEnabled(enabled) {
    // Muting must work immediately even when preference storage has become full.
    this.override = false; this.stop();
    try { this.getStorage().setItem(SOUND_KEY, enabled ? 'on' : 'off'); }
    catch { throw new Error('Could not save the sound setting. Sound stays off.'); }
    this.override = enabled;
  }
  stop() {
    this.generation++;
    for (const source of this.sources) { try { source.stop(); } catch { /* Already ended. */ } }
    this.sources.clear();
  }
  async play(cue) {
    if (!this.enabled() || this.isHidden() || !tones[cue]) return;
    const generation = this.generation;
    try {
      this.audio ??= this.createAudio();
      if (this.audio.state === 'suspended') await this.audio.resume();
      if (generation !== this.generation || !this.enabled() || this.isHidden()) return;
      this.stop();
      const start = this.audio.currentTime;
      tones[cue].forEach((frequency, index) => {
        const oscillator = this.audio.createOscillator(), gain = this.audio.createGain(), at = start + index * .09;
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.035, at + .01);
        gain.gain.exponentialRampToValueAtTime(.001, at + .13);
        oscillator.connect(gain); gain.connect(this.audio.destination);
        this.sources.add(oscillator);
        oscillator.onended = () => { this.sources.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(at); oscillator.stop(at + .14);
      });
    } catch { throw new Error('Sound could not play. Check your browser’s audio permission.'); }
  }
}
export default new LocalSoundService();

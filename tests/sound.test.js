import { describe, expect, it, vi } from 'vitest';
import { LocalSoundService, SOUND_KEY } from '../src/services/SoundService.js';
function harness() {
  const data = new Map(), sources = [], getStorage = () => ({ getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) });
  const audio = { state: 'running', currentTime: 0, destination: {}, createOscillator() {
    const source = { frequency: {}, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() }; sources.push(source); return source;
  }, createGain: () => ({ gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }) };
  const createAudio = vi.fn(() => audio), service = new LocalSoundService({ getStorage, createAudio });
  return { service, data, sources, audio, createAudio };
}
describe('opt-in sound', () => {
  it('defaults to silence and allocates no audio before opt-in', async () => {
    const { service, createAudio } = harness(); expect(service.enabled()).toBe(false); await service.play('correct'); expect(createAudio).not.toHaveBeenCalled();
  });
  it('persists preference, generates a short cue and immediately stops it when muted', async () => {
    const { service, data, sources } = harness(); service.setEnabled(true); await service.play('victory');
    expect(data.get(SOUND_KEY)).toBe('on'); expect(sources).toHaveLength(3); expect(sources[0].start).toHaveBeenCalled();
    service.setEnabled(false); expect(sources.every(source => source.stop.mock.calls.length === 2)).toBe(true); expect(service.enabled()).toBe(false);
  });
  it('does not overlap cues or play while a tab is hidden', async () => {
    const { service, sources } = harness(); service.setEnabled(true); await service.play('correct'); await service.play('wrong');
    expect(sources[0].stop).toHaveBeenCalledTimes(2); service.isHidden = () => true; await service.play('victory'); expect(sources).toHaveLength(4);
  });
  it('cannot play a queued cue after muting during browser audio resume', async () => {
    const { service, sources, audio } = harness(); let finish;
    audio.state = 'suspended'; audio.resume = () => new Promise(resolve => { finish = resolve; }); service.setEnabled(true);
    const queued = service.play('correct'); service.setEnabled(false); finish(); await queued; expect(sources).toHaveLength(0);
  });
  it('honors mute when storage writes fail, then syncs a preference changed in another tab', async () => {
    const { service, sources, data } = harness(); service.setEnabled(true); await service.play('correct');
    service.getStorage = () => ({ getItem: key => data.get(key), setItem() { throw new Error(); } });
    expect(() => service.setEnabled(false)).toThrow('Could not save'); await service.play('victory'); expect(sources).toHaveLength(2);
    expect(service.enabled()).toBe(false); expect(service.sync()).toBe(true);
  });
  it('keeps unavailable storage quiet and surfaces audio failures without affecting games', async () => {
    const service = new LocalSoundService({ getStorage: () => { throw new Error(); } });
    expect(service.enabled()).toBe(false); expect(() => service.setEnabled(true)).toThrow('Could not save'); await service.play('correct');
    const { service: unavailable } = harness(); unavailable.setEnabled(true); unavailable.createAudio = () => { throw new Error(); };
    await expect(unavailable.play('correct')).rejects.toThrow('Sound could not play');
  });
});

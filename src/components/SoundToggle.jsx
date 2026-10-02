import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';
export default function SoundToggle() {
  const { enabled, error, toggle } = useSound();
  return <div className="sound-control"><button type="button" className="sound-toggle" aria-pressed={enabled} aria-label="Sound effects" onClick={toggle}>{enabled ? <Volume2 size={18} /> : <VolumeX size={18} />} Sound {enabled ? 'on' : 'off'}</button>{error && <p role="status">{error}</p>}</div>;
}

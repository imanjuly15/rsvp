import { useEffect, useState, useSyncExternalStore } from 'react';
import Music from '../lib/music.js';

export default function SoundButton() {
  const playing = useSyncExternalStore(Music.subscribe, Music.isPlaying);
  const [compact, setCompact] = useState(false);

  // Shrinks to its icon while reading, so it never sits on top of a heading.
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`sound-btn${playing ? ' on' : ''}${compact ? ' compact' : ''}`}
      id="sound-btn"
      aria-pressed={playing}
      aria-label={playing ? 'Pause the mantra' : 'Play the mantra'}
      onClick={Music.toggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4Z" />
        <path className="waves" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        <path className="mute" d="m22 9-6 6M16 9l6 6" />
      </svg>
      <span>{playing ? 'Mantra on' : 'Play mantra'}</span>
    </button>
  );
}

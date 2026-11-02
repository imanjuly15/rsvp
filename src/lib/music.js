/* The mantra recording. Browsers only allow sound after a touch, so it tries at once, then again at each touch until one is allowed. */
const LEVEL = .45;
const audio = new Audio('assets/moksha-mantras.mp3');
audio.loop = true;
audio.preload = 'none';
const listeners = new Set();
let fade = 0;

const emit = () => listeners.forEach((listener) => listener());
audio.addEventListener('play', emit);
audio.addEventListener('pause', emit);

function ramp(to, ms, then) {
  cancelAnimationFrame(fade);
  const from = audio.volume;
  const began = performance.now();
  function step(now) {
    // The first frame's timestamp can fall just before "began", and a volume below zero throws.
    const t = Math.max(0, Math.min((now - began) / ms, 1));
    audio.volume = from + (to - from) * t;
    if (t < 1) fade = requestAnimationFrame(step);
    else then?.();
  }
  fade = requestAnimationFrame(step);
}

function play(fadeMs = 3000) {
  audio.volume = 0;
  audio.play()?.then(() => ramp(LEVEL, fadeMs)).catch(emit);
}

/** Keeps asking until the browser allows sound. The sound button answers for itself, so touching it ends the asking. */
function playWhenAllowed(fadeMs) {
  const events = ['click', 'touchend', 'keydown'];
  const stop = () => events.forEach((name) => document.removeEventListener(name, attempt, true));
  function attempt(e) {
    if (e?.target.closest?.('#sound-btn')) {
      stop();
      return;
    }
    if (!audio.paused) return;
    audio.volume = 0;
    audio.play()?.then(() => {
      stop();
      ramp(LEVEL, fadeMs);
    }).catch(emit);
  }
  events.forEach((name) => document.addEventListener(name, attempt, true));
  attempt();
}

function pause() {
  ramp(0, 500, () => audio.pause());
}

export default {
  play,
  playWhenAllowed,
  pause,
  toggle: () => (audio.paused ? play(1200) : pause()),
  isPlaying: () => !audio.paused,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

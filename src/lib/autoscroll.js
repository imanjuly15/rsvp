/*
 * After the opening, the page drifts slowly down to the RSVP card and stops there.
 * Any touch, scroll, click or key press hands control back to the guest for good: it never fights them.
 * Not used with "reduce motion" (the caller skips it) or when the page was opened at a #section.
 */
const START_AFTER_MS = 2500;
const PIXELS_PER_SECOND = 40;
const MAX_STEP_MS = 50; // after a hidden tab or a slow frame, never jump: move at most one normal step
const STOP_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

/** @param {string} targetId  the element to stop at (its top lands under the browser's scroll padding) */
export function startAutoScroll(targetId) {
  if (window.location.hash) return;
  const target = document.getElementById(targetId);
  if (!target) return;

  let frame = 0;
  let timer = 0;
  let last = 0;
  let y = window.scrollY;

  // Layout position (offsetTop), not getBoundingClientRect: sections rise into place as they are revealed,
  // and the moving transform would shift the stopping point and make the page jump back.
  const stopAt = () => {
    let top = 0;
    for (let el = target; el; el = el.offsetParent) top += el.offsetTop;
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(top - padding, maxScroll);
  };

  function stop() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    STOP_EVENTS.forEach((type) => window.removeEventListener(type, stop, true));
  }

  function step(now) {
    const dt = last ? Math.min(now - last, MAX_STEP_MS) : 0;
    last = now;
    const end = stopAt();
    y = Math.min(y + (PIXELS_PER_SECOND * dt) / 1000, end);
    // 'instant' on purpose: the page's CSS asks for smooth scrolling, which would turn every small step into an animation.
    window.scrollTo({ top: y, behavior: 'instant' });
    if (y >= end) stop();
    else frame = requestAnimationFrame(step);
  }

  STOP_EVENTS.forEach((type) => window.addEventListener(type, stop, { capture: true, passive: true }));
  timer = setTimeout(() => {
    y = window.scrollY;
    frame = requestAnimationFrame(step);
  }, START_AFTER_MS);
}

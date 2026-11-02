import { useEffect, useState } from 'react';
import { EVENT } from '../event.js';
import { mapHref, placeOf, wazeHref } from '../lib/dates.js';

export default function Dock() {
  const [open, setOpen] = useState(false);
  const place = placeOf(EVENT);

  useEffect(() => {
    const onClick = (e) => { if (!e.target.closest('#dock-wrap')) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="dock-wrap" id="dock-wrap">
      <div className={`dock-panel${open ? ' open' : ''}`} id="panel-map">
        <h3>{EVENT.venue_name || 'Location'}</h3>
        {place ? (
          <>
            {EVENT.venue_address && <p>{EVENT.venue_address}</p>}
            <div className="panel-links">
              <a href={mapHref(EVENT)} target="_blank" rel="noopener">Google Maps</a>
              <a href={wazeHref(EVENT)} target="_blank" rel="noopener">Waze</a>
            </div>
          </>
        ) : (
          <p>The venue will be announced here once confirmed.</p>
        )}
      </div>
      <nav className="dock" aria-label="Quick links">
        <a className="primary" href="#rsvp" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          RSVP
        </a>
        <button type="button" id="dock-map" aria-expanded={open} aria-controls="panel-map" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
          Location
        </button>
      </nav>
    </div>
  );
}

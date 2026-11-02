import { EVENT } from '../event.js';
import { longDate, mapHref, parseWhen, targetOf, timeOf } from '../lib/dates.js';
import Countdown from './Countdown.jsx';
import Reveal from './Reveal.jsx';

function Row({ term, children }) {
  if (!children) return null;
  return (
    <>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </>
  );
}

export default function Details() {
  const when = parseWhen(EVENT.ceremony_datetime);
  const ends = EVENT.ceremony_end ? parseWhen(`${EVENT.ceremony_datetime.slice(0, 10)}T${EVENT.ceremony_end}`) : null;
  const venue = [EVENT.venue_name, EVENT.venue_address].filter(Boolean).join('\n');
  const href = mapHref(EVENT);

  return (
    <Reveal className="details mist" id="details" aria-labelledby="details-title">
      <h2 id="details-title">{EVENT.ceremony_name}</h2>
      {when || venue ? (
        <>
          {when && <Countdown target={targetOf(when)} />}
          <dl className="detail-list">
            <Row term="Date">{when ? longDate(when) : 'To be announced'}</Row>
            <Row term="Time">
              {when && when.h !== null ? `${timeOf(when)}${ends ? ` – ${timeOf(ends)}` : ''}` : 'To be announced'}
            </Row>
            <Row term="Venue">{venue || 'To be announced'}</Row>
            <Row term="Attire">{EVENT.dress_code}</Row>
          </dl>
          {href && <a className="pill-link" href={href} target="_blank" rel="noopener">Open in Maps</a>}
          {EVENT.note && <p className="details-note">{EVENT.note}</p>}
        </>
      ) : (
        <p className="tba">Details of the luncheon will be shared here once confirmed.</p>
      )}
    </Reveal>
  );
}

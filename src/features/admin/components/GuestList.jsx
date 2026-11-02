import { useRef, useState } from 'react';
import { TABLE_MEDIA_QUERY } from '../constants/admin.constants.js';
import { useGuestFilter } from '../hooks/useAdminData.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate } from '../utils/admin.utils.js';
import GuestFilters from './GuestFilters.jsx';
import Pagination from './Pagination.jsx';
import GuestDialog from './GuestDialog.jsx';
import GuestCompactRow from './GuestCompactRow.jsx';
import GuestTableRow from './GuestTableRow.jsx';

const NEW_GUEST = 'new';
const COLUMNS = ['colGuest', 'colStatus', 'colAllowed', 'colComing', 'colPhone', 'colOpened', 'colActions'];

/** The main work area: add, filter, and the guest rows (a row turns into a form while editing). */
export default function GuestList({ guests, hasSiteUrl, notice, highlightId, onSave }) {
  const filter = useGuestFilter(guests, highlightId);
  const wide = useMediaQuery(TABLE_MEDIA_QUERY);
  const Row = wide ? GuestTableRow : GuestCompactRow;
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(true);
  const sectionRef = useRef(null);
  const done = () => setEditing(null);

  // A new page starts at the top of the guest list, not wherever the last page ended.
  function goToPage(page) {
    filter.setPage(page);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
  }

  let empty = null;
  if (!guests.length) empty = <p className="empty">{S.noGuestsYet}</p>;
  else if (!filter.visible.length) {
    empty = (
      <div className="empty">
        <p>{filter.query ? fillTemplate(S.noMatch, { q: filter.query }) : S.noMatchFilter}</p>
        <button type="button" className="btn btn-secondary" onClick={filter.reset}>{filter.query ? S.clearSearch : S.showAll}</button>
      </div>
    );
  }

  return (
    <section ref={sectionRef} className="card guests" aria-labelledby="guests-title">
      <div className="card-head">
        <h2 id="guests-title">
          <button type="button" className="section-toggle" aria-expanded={open} aria-controls="guests-body" onClick={() => setOpen(!open)}>
            {S.guestsTitle} <span className="tab-count">{guests.length.toLocaleString('en')}</span>
          </button>
        </h2>
        {/* Always visible, even with the section closed. The form opens as a pop-up; the section opens too, to show the new row. */}
        <button type="button" className="btn btn-primary" onClick={() => { setOpen(true); setEditing(NEW_GUEST); }}>{S.addGuest}</button>
      </div>
      <div id="guests-body" hidden={!open}>
      <p className="notice" role="status">{notice}</p>
      {!hasSiteUrl && <p className="hint">{S.noSiteUrl}</p>}

      {guests.length > 0 && <GuestFilters filter={filter} />}
      {empty}
      {filter.visible.length > 0 && (
        <>
          {wide && (
            <div className="table-head" aria-hidden="true">
              {COLUMNS.map((c) => <span key={c} className={c === 'colActions' ? 'col-end' : undefined}>{S[c]}</span>)}
            </div>
          )}
          <ul className="rows">
            {filter.visible.map((g) => (
              <li key={g.id}>
                <Row guest={g} highlighted={g.id === highlightId} onEdit={() => setEditing(g.id)} />
              </li>
            ))}
          </ul>
          <Pagination paging={filter.paging} onPage={goToPage} />
        </>
      )}
      </div>

      {editing === NEW_GUEST && <GuestDialog initial={null} onSave={(g) => onSave(g, null)} onDone={done} />}
      {editing && editing !== NEW_GUEST && (
        <GuestDialog initial={guests.find((g) => g.id === editing)} onSave={(x) => onSave(x, editing)} onDone={done} />
      )}
    </section>
  );
}

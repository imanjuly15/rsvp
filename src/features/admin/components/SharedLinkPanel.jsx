import { useRef, useState } from 'react';
import { TABLE_MEDIA_QUERY } from '../constants/admin.constants.js';
import { usePagedList } from '../hooks/useAdminData.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import LinkActions from './LinkActions.jsx';
import Pagination from './Pagination.jsx';
import PublicReplyRow from './PublicReplyRow.jsx';

const COLUMNS = ['colName', 'colAnswer', 'colPax', 'colPhone', 'colReplied'];

/** The public link for groups, then its replies as a table (15 per page). The replies part opens and closes. */
export default function SharedLinkPanel({ settings, replies }) {
  const [open, setOpen] = useState(true);
  const wide = useMediaQuery(TABLE_MEDIA_QUERY);
  const { paging, setPage } = usePagedList(replies);
  const listRef = useRef(null);

  function goToPage(page) {
    setPage(page);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    listRef.current.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
  }

  return (
    <section className="card" aria-labelledby="shared-title">
      <h2 id="shared-title">{S.sharedTitle}</h2>
      <p className="card-sub">{S.sharedHint}</p>
      {settings.siteUrl ? (
        <>
          <p className="link-box">{settings.sharedLink}</p>
          <LinkActions link={settings.sharedLink} whatsappUrl={settings.sharedWhatsappUrl} whatsappLabel={S.shareWhatsapp} primary />
        </>
      ) : (
        <p className="hint">{S.noSiteUrl}</p>
      )}

      <div ref={listRef} className="subsection">
        <h3>
          <button type="button" className="section-toggle" aria-expanded={open} aria-controls="public-replies" onClick={() => setOpen(!open)}>
            {S.sharedRepliesTitle} <span className="tab-count">{replies.length.toLocaleString('en')}</span>
          </button>
        </h3>
        <div id="public-replies" hidden={!open}>
          {!replies.length && <p className="empty">{S.noSharedReplies}</p>}
          {replies.length > 0 && (
            <>
              {wide && (
                <div className="ptable-head" aria-hidden="true">
                  {COLUMNS.map((c) => <span key={c} className={c === 'colPax' ? 'num' : undefined}>{S[c]}</span>)}
                </div>
              )}
              <ul className="rows">
                {paging.items.map((r, i) => <li key={`${r.timestamp}-${i}`}><PublicReplyRow reply={r} wide={wide} /></li>)}
              </ul>
              <Pagination paging={paging} onPage={goToPage} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

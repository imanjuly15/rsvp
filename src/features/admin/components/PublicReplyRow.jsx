import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate, shortStamp } from '../utils/admin.utils.js';

/**
 * One reply from the public link. Wide screens: cells under the table header (Name · Answer · Pax · Phone · Replied).
 * Phones: name and answer, then "3 pax · phone · time". The note sits under the name either way.
 */
export default function PublicReplyRow({ reply, wide }) {
  const yes = reply.attending === 'yes';
  const badge = <span className={`badge ${yes ? 'badge-ok' : 'badge-neutral'}`}>{yes ? S.responseYes : S.responseNo}</span>;
  const pax = yes ? reply.pax : 0;
  const when = shortStamp(reply.timestamp);
  const note = reply.note && <p className="note">“{reply.note}”</p>;

  if (wide) {
    return (
      <article className="prow">
        <div className="cell-name"><h3>{reply.name}</h3>{note}</div>
        <div>{badge}</div>
        <div className="num">{pax}</div>
        <div>{reply.phone || S.noPhone}</div>
        <div>{when}</div>
      </article>
    );
  }
  return (
    <article className="prow-compact">
      <div className="mini-head"><h3>{reply.name}</h3>{badge}</div>
      <p className="mini-meta">
        {[fillTemplate(S.allowedShort, { n: pax }), reply.phone, when].filter(Boolean).join(' · ')}
      </p>
      {note}
    </article>
  );
}

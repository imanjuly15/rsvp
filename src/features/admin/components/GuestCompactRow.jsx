import { useState } from 'react';
import { STATUS } from '../constants/admin.constants.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate, guestStateText, guestTone, shortStamp } from '../utils/admin.utils.js';
import LinkActions from './LinkActions.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';

/**
 * One guest on a phone, in about 70px: name, status and allowed count, plus a one-tap Send while they
 * have not replied. Tapping the name opens the details (phone, opened, note) and Copy link / Edit.
 */
export default function GuestCompactRow({ guest, highlighted, onEdit }) {
  const [open, setOpen] = useState(false);
  const waiting = guest.status !== STATUS.REPLIED;
  const moreId = `more-${guest.id}`;

  return (
    <article className={`crow${highlighted ? ' is-new' : ''}${open ? ' is-open' : ''}`}>
      <div className="crow-main">
        <button type="button" className="crow-toggle" aria-expanded={open} aria-controls={moreId} onClick={() => setOpen(!open)}>
          <span className="crow-name">{guest.name}</span>
          <span className="crow-sub">
            <span className={`badge badge-${guestTone(guest)}`}>{guestStateText(guest)}</span>
            <span>{guest.reply && guest.reply.attending === 'yes' ? fillTemplate(S.paxOf, { coming: guest.reply.pax, allowed: guest.pax }) : fillTemplate(S.allowedShort, { n: guest.pax })}</span>
          </span>
        </button>
        {waiting && (
          <WhatsAppButton url={guest.whatsappUrl} className="btn btn-send crow-send" label={S.sendShort} ariaLabel={fillTemplate(S.sendTo, { name: guest.name })} />
        )}
      </div>

      {open && (
        <div id={moreId} className="crow-more">
          <p className="crow-facts">
            <span>{S.colPhone} <strong>{guest.phone || S.noPhone}</strong></span>
            <span>{S.colOpened} <strong>{guest.firstOpened ? shortStamp(guest.firstOpened) : S.notYet}</strong></span>
          </p>
          {guest.reply && guest.reply.note && <p className="note">“{guest.reply.note}”</p>}
          {/* While waiting, Send is already on the row; after a reply, WhatsApp is offered here instead. */}
          <LinkActions link={guest.link} whatsappUrl={waiting ? '' : guest.whatsappUrl}>
            <button type="button" className="btn btn-ghost" onClick={onEdit} aria-label={`${S.edit} ${guest.name}`}>{S.edit}</button>
          </LinkActions>
        </div>
      )}
    </article>
  );
}

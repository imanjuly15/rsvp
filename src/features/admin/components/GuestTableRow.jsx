import { STATUS } from '../constants/admin.constants.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { guestStateText, guestTone, shortStamp } from '../utils/admin.utils.js';
import LinkActions from './LinkActions.jsx';

/**
 * One guest as a table row (wide screens). The cells line up under the table header; the small fact labels
 * are read by screen readers only.
 */
export default function GuestTableRow({ guest, highlighted, onEdit }) {
  const waiting = guest.status !== STATUS.REPLIED;
  const facts = [
    [S.colAllowed, guest.pax],
    [S.colComing, guest.reply && guest.reply.attending === 'yes' ? guest.reply.pax : S.notYet],
    [S.colPhone, guest.phone || S.noPhone],
    [S.colOpened, guest.firstOpened ? shortStamp(guest.firstOpened) : S.notYet],
  ];

  return (
    <article className={`row${highlighted ? ' is-new' : ''}`}>
      <div className="cell-name">
        <h3>{guest.name}</h3>
        {guest.reply && guest.reply.note && <p className="note">“{guest.reply.note}”</p>}
      </div>
      <div className="cell-status"><span className={`badge badge-${guestTone(guest)}`}>{guestStateText(guest)}</span></div>
      <div className="cell-facts">
        {facts.map(([label, value]) => (
          <span key={label}><span className="fact-label">{label} </span><span className="fact-value">{value}</span></span>
        ))}
      </div>
      <LinkActions className="cell-actions" link={guest.link} whatsappUrl={guest.whatsappUrl} whatsappLabel={waiting ? S.sendWhatsapp : S.whatsapp} primary={waiting}>
        <button type="button" className="btn btn-ghost" onClick={onEdit} aria-label={`${S.edit} ${guest.name}`}>{S.edit}</button>
      </LinkActions>
    </article>
  );
}

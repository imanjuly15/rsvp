/* Small pure helpers for the admin page. No React, no network. */
import { STATUS } from '../constants/admin.constants.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? String(vars[key]) : match));
}

const STATUS_TEXT = { [STATUS.REPLIED]: S.statusReplied, [STATUS.OPENED]: S.statusOpened, [STATUS.NOT_OPENED]: S.statusNotOpened };

export const statusText = (status) => STATUS_TEXT[status] || '';

/** What a guest row says on the right: their answer once they replied, otherwise how far they got. */
export function guestStateText(guest) {
  if (guest.reply) return guest.reply.attending === 'yes' ? S.replyYes : S.replyNo;
  return statusText(guest.status);
}

/** "2026-11-06" -> "6 Nov". */
export function shortDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}` : '';
}

/** "2026-11-02 14:05:00" -> "2 Nov, 2:05pm". The Sheet's times are already Malaysia time. */
export function shortStamp(stamp) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(stamp || '');
  if (!m) return stamp || '';
  const h = Number(m[4]);
  return `${shortDate(stamp)}, ${((h + 11) % 12) + 1}:${m[5]}${h < 12 ? 'am' : 'pm'}`;
}

/** A Date -> "2:05pm", in this device's time, for "Updated …". */
export function clockTime(date) {
  const h = date.getHours();
  return `${((h + 11) % 12) + 1}:${String(date.getMinutes()).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
}

/** The one-line RSVP state shown under the event title. */
export function rsvpStateText(settings) {
  const date = shortDate(settings.deadline);
  if (!settings.rsvpOpen) return S.stateClosedByHost;
  if (!settings.open) return fillTemplate(S.stateDeadlinePassed, { date });
  return date ? fillTemplate(S.stateOpenUntil, { date }) : S.stateOpen;
}

/** Badge colour for a guest's state: green coming, amber opened but silent, grey everything else. */
export function guestTone(guest) {
  if (guest.reply) return guest.reply.attending === 'yes' ? 'ok' : 'neutral';
  return guest.status === STATUS.OPENED ? 'warn' : 'neutral';
}

/**
 * Only a wa.me chat link may become a WhatsApp button. Not the general https check: names like
 * "Dato' Ashok" leave an apostrophe in the encoded message, and React escapes attribute values anyway.
 */
export const isWhatsappUrl = (url) => typeof url === 'string' && /^https:\/\/wa\.me\/\d*\?text=\S*$/.test(url);

/** Digits only, the way WhatsApp wants them: "+60 12-345 6789" -> "60123456789". */
export const phoneDigits = (text) => String(text || '').replace(/[\s\-()+]/g, '');

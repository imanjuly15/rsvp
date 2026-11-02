/*
 * Offline stand-in for the admin actions in apps-script/Code.gs, used when VITE_RSVP_USE_MOCK=true.
 * Demo key: demo-admin-key-for-testing-only  (any other key is "Wrong admin key"). Data lives in memory only.
 * Add ?mock=many to the admin URL for 1,000 extra fake guests (to try paging).
 */
import { ADMIN_MESSAGE, LIMITS, OP, STATUS } from '../constants/admin.constants.js';

const DEMO_KEY = 'demo-admin-key-for-testing-only';
// Fixed so a reload stays logged in, like the real script's 2-hour session. Any other token is "expired".
const DEMO_TOKEN = 'f'.repeat(64);
const SITE = 'https://example.pages.dev';
const DELAY_MS = 400;
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const state = {
  settings: { eventTitle: 'Memorial Luncheon', deadline: '2026-12-31', rsvpOpen: true, sharedMaxPax: 20 },
  guests: [
    { id: 'DEMOAAA1', name: "Dato' Ashok", pax: 2, phone: '60123456789', firstOpened: '2026-11-02 10:15:00' },
    { id: 'DEMOBBB2', name: 'Puan Lina', pax: 3, phone: '', firstOpened: '2026-11-01 20:03:11' },
    { id: 'DEMOCCC3', name: 'YBhg Dato’ Ashok & YBhg Datin Shivajini', pax: 4, phone: '60198887777', firstOpened: '' },
  ],
  responses: [
    { timestamp: '2026-11-01 20:05:40', guestId: 'DEMOBBB2', name: 'Puan Lina', attending: 'yes', pax: 3, note: 'Om Shanti', source: 'vip', verified: true, updated: '', phone: '' },
    { timestamp: '2026-11-02 09:00:00', guestId: '', name: 'Shared Guest', attending: 'no', pax: 0, note: '', source: 'shared', verified: false, updated: '', phone: '0123456789' },
  ],
};

// ?mock=many: a big fake list for trying paging and speed.
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === 'many') {
  for (let i = 1; i <= 1000; i++) {
    const n = String(i).padStart(4, '0');
    state.guests.push({ id: `MANY${n}`, name: `Test Guest ${n}`, pax: (i % 4) + 1, phone: i % 3 ? `6012${n}${n}` : '', firstOpened: i % 2 ? '2026-11-02 09:00:00' : '' });
  }
  for (let i = 1; i <= 40; i++) {
    const n = String(i).padStart(2, '0');
    state.responses.push({ timestamp: `2026-11-02 1${i % 10}:${n}:00`, guestId: '', name: `Public Guest ${n}`, attending: i % 4 ? 'yes' : 'no', pax: i % 4 ? (i % 3) + 1 : 0, note: i % 5 ? '' : 'See you there', source: 'shared', verified: false, updated: '', phone: i % 2 ? `01${n}2345678` : '' });
  }
}

const ok = (message, data) => ({ status: true, message, data });
const fail = (message) => ({ status: false, message });
const later = (fn) => new Promise((resolve) => setTimeout(() => resolve(fn()), DELAY_MS));
const wa = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

function overview() {
  const { settings } = state;
  const guests = state.guests.map((g) => {
    const reply = state.responses.find((r) => r.guestId === g.id) || null;
    const link = `${SITE}/?id=${g.id}`;
    return {
      ...g,
      link,
      whatsappUrl: wa(g.phone, `Dear ${g.name}, please open your invitation: ${link}`),
      reply: reply && { attending: reply.attending, pax: reply.pax, note: reply.note, updated: reply.updated || reply.timestamp },
      status: reply ? STATUS.REPLIED : g.firstOpened ? STATUS.OPENED : STATUS.NOT_OPENED,
    };
  });
  const yes = state.responses.filter((r) => r.attending === 'yes');
  return {
    settings: { ...settings, open: settings.rsvpOpen, siteUrl: SITE, sharedLink: SITE, sharedWhatsappUrl: wa('', `You are invited: ${SITE}`) },
    summary: {
      invited: guests.length,
      replied: guests.filter((g) => g.status === STATUS.REPLIED).length,
      notOpened: guests.filter((g) => g.status === STATUS.NOT_OPENED).length,
      attendingReplies: yes.length,
      declinedReplies: state.responses.length - yes.length,
      peopleComing: yes.reduce((sum, r) => sum + r.pax, 0),
      sharedReplies: state.responses.filter((r) => r.source === 'shared').length,
    },
    guests,
    responses: state.responses,
  };
}

function cleanGuest(b) {
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name || name.length > LIMITS.NAME_MAX) return { error: `Name must be 1 to ${LIMITS.NAME_MAX} characters` };
  if (!Number.isInteger(b.pax) || b.pax < LIMITS.PAX_MIN || b.pax > LIMITS.PAX_MAX) return { error: `Guests allowed must be a whole number from 1 to ${LIMITS.PAX_MAX}` };
  const phone = String(b.phone || '').replace(/[\s\-()+]/g, '');
  if (phone && (!/^\d{8,15}$/.test(phone) || phone.startsWith('0'))) return { error: 'Phone must be digits with the country code, like 60123456789' };
  return { name, pax: b.pax, phone };
}

function handle(b) {
  if (b.op === OP.LOGIN) {
    if (b.key !== DEMO_KEY) return fail('Wrong admin key');
    return ok('OK', { token: DEMO_TOKEN, expiresInSeconds: 7200 });
  }
  if (b.token !== DEMO_TOKEN) return fail(ADMIN_MESSAGE.SESSION);
  if (b.op === OP.OVERVIEW) return ok('OK', overview());
  if (b.op === OP.ADD_GUEST || b.op === OP.UPDATE_GUEST) {
    const g = cleanGuest(b);
    if (g.error) return fail(g.error);
    if (b.op === OP.UPDATE_GUEST) {
      const existing = state.guests.find((x) => x.id === b.id);
      if (!existing) return fail('Invitation not found');
      Object.assign(existing, g);
      return ok('Guest updated', { id: existing.id });
    }
    const id = Array.from({ length: 8 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join('');
    state.guests.push({ id, ...g, firstOpened: '' });
    return ok('Guest added', { id });
  }
  if (b.op === OP.SET_CONFIG) {
    if (b.rsvpOpen !== undefined) state.settings.rsvpOpen = b.rsvpOpen;
    if (b.deadline !== undefined) state.settings.deadline = b.deadline;
    return ok('Settings saved', {});
  }
  return fail('Invalid request');
}

export const adminMock = { post: (body) => later(() => handle(body)) };

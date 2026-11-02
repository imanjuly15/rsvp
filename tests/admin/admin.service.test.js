import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, NetworkError } from '../../src/features/rsvp/shared.js';
import { SESSION_STORAGE_KEY } from '../../src/features/admin/constants/admin.constants.js';
import {
  checkGuestForm, clearSession, countByStatus, pageOf, paginate, responseTotals, filterGuests, loadOverview, logIn, mapAdminError, readSession, saveGuest, saveSession, sharedReplies,
} from '../../src/features/admin/services/admin.service.js';
import { ADMIN_STRINGS as S } from '../../src/features/admin/strings/admin.strings.js';
import { guestStateText, guestTone, isWhatsappUrl, phoneDigits, rsvpStateText, shortDate, shortStamp, statusText } from '../../src/features/admin/utils/admin.utils.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
}

test('session: saved, read back, expires, cleared', () => {
  const store = memoryStorage();
  saveSession('abc', 60, store, 1000);
  assert.equal(readSession(store, 1000 + 59_000), 'abc');
  assert.equal(readSession(store, 1000 + 60_000), '');
  clearSession(store);
  assert.equal(store.m.has(SESSION_STORAGE_KEY), false);
});

test('session: broken or blocked storage never throws', () => {
  assert.equal(readSession({ getItem: () => '{bad json' }), '');
  assert.equal(readSession({ getItem: () => { throw new Error('blocked'); } }), '');
  assert.doesNotThrow(() => saveSession('t', 1, { setItem: () => { throw new Error('blocked'); } }));
});

test('mapAdminError: session expiry, server text, network', () => {
  assert.deepEqual(mapAdminError(new ApiError('Session expired. Please log in again')), { sessionExpired: true, message: 'Session expired. Please log in again' });
  assert.deepEqual(mapAdminError(new ApiError('Wrong admin key')), { sessionExpired: false, message: 'Wrong admin key' });
  assert.deepEqual(mapAdminError(new NetworkError()), { sessionExpired: false, message: S.networkError });
});

test('logIn: empty key never calls the server', async () => {
  let called = false;
  const out = await logIn('  ', { api: { login: async () => { called = true; } } });
  assert.deepEqual(out, { ok: false, message: S.needKey });
  assert.equal(called, false);
});

test('logIn: trims the key, returns the token or the server message', async () => {
  let sent;
  globalThis.sessionStorage = memoryStorage();
  const ok = await logIn('  KEY  ', { api: { login: async (k) => { sent = k; return { token: 't'.repeat(64), expiresInSeconds: 7200 }; } } });
  assert.equal(sent, 'KEY');
  assert.deepEqual(ok, { ok: true, token: 't'.repeat(64) });
  assert.equal(readSession(globalThis.sessionStorage), 't'.repeat(64));
  const bad = await logIn('x', { api: { login: async () => { throw new ApiError('Wrong admin key'); } } });
  assert.deepEqual(bad, { ok: false, message: 'Wrong admin key' });
  delete globalThis.sessionStorage;
});

test('loadOverview: never throws, flags session expiry', async () => {
  const out = await loadOverview('t', { api: { getOverview: async () => { throw new ApiError('Session expired. Please log in again'); } } });
  assert.equal(out.ok, false);
  assert.equal(out.sessionExpired, true);
});

test('checkGuestForm', () => {
  assert.deepEqual(checkGuestForm({ name: '  Dato\' Ashok ', pax: ' 2 ', phone: '+60 12-345 6789' }), { errors: {}, guest: { name: "Dato' Ashok", pax: 2, phone: '60123456789' } });
  assert.deepEqual(checkGuestForm({ name: 'A', pax: '1', phone: '' }).guest, { name: 'A', pax: 1, phone: '' });
  const e = checkGuestForm({ name: ' ', pax: '21', phone: '0123456789' }).errors;
  assert.deepEqual(checkGuestForm({ name: 'A', pax: '20', phone: '' }).errors, {});
  assert.deepEqual(e, { name: S.needName, pax: S.badPax, phone: S.badPhone });
  assert.equal(checkGuestForm({ name: 'A', pax: '1.5', phone: '' }).errors.pax, S.badPax);
  assert.equal(checkGuestForm({ name: 'A', pax: '2', phone: '60abc' }).errors.phone, S.badPhone);
});

test('saveGuest: add without id, update with id', async () => {
  const calls = [];
  const api = { addGuest: async (t, g) => { calls.push(['add', g]); return { id: 'NEW' }; }, updateGuest: async (t, g) => { calls.push(['update', g]); return { id: g.id }; } };
  await saveGuest('t', { name: 'A', pax: 1, phone: '' }, null, { api });
  await saveGuest('t', { name: 'B', pax: 2, phone: '' }, 'ABCD2345', { api });
  assert.deepEqual(calls, [['add', { name: 'A', pax: 1, phone: '' }], ['update', { id: 'ABCD2345', name: 'B', pax: 2, phone: '' }]]);
});

test('filterGuests: by status, name and phone', () => {
  const guests = [
    { id: '1', name: "Dato' Ashok", phone: '60123456789', status: 'replied' },
    { id: '2', name: 'Puan Lina', phone: '', status: 'not_opened' },
  ];
  assert.equal(filterGuests(guests, '', 'all').length, 2);
  assert.deepEqual(filterGuests(guests, '', 'not_opened').map((g) => g.id), ['2']);
  assert.deepEqual(filterGuests(guests, 'ashok', 'all').map((g) => g.id), ['1']);
  assert.deepEqual(filterGuests(guests, '012-345', 'all').map((g) => g.id), ['1']);
  assert.deepEqual(filterGuests(guests, 'lina', 'replied'), []);
});

test('admin utils', () => {
  assert.equal(statusText('opened'), S.statusOpened);
  assert.equal(guestStateText({ status: 'replied', reply: { attending: 'yes', pax: 2 } }), 'Coming');
  assert.equal(guestStateText({ status: 'replied', reply: { attending: 'no', pax: 0 } }), 'Not coming');
  assert.equal(guestStateText({ status: 'not_opened', reply: null }), 'Not opened');
  assert.equal(guestTone({ status: 'replied', reply: { attending: 'yes', pax: 2 } }), 'ok');
  assert.equal(guestTone({ status: 'replied', reply: { attending: 'no', pax: 0 } }), 'neutral');
  assert.equal(guestTone({ status: 'opened', reply: null }), 'warn');
  assert.equal(guestTone({ status: 'not_opened', reply: null }), 'neutral');
  assert.equal(phoneDigits('+60 (12) 345-6789'), '60123456789');
});

test('isWhatsappUrl: wa.me chat links only, apostrophes allowed', () => {
  assert.equal(isWhatsappUrl(`https://wa.me/60123456789?text=${encodeURIComponent("Dear Dato' Ashok")}`), true);
  assert.equal(isWhatsappUrl(`https://wa.me/?text=${encodeURIComponent('Hi')}`), true);
  for (const bad of ['javascript:alert(1)', 'https://evil.com/?text=x', 'http://wa.me/1?text=x', 'https://wa.me/60abc?text=x', 'https://wa.me/1?text=a b', '', null]) {
    assert.equal(isWhatsappUrl(bad), false, String(bad));
  }
});

test('human dates and the RSVP state line', () => {
  assert.equal(shortDate('2026-11-06'), '6 Nov');
  assert.equal(shortStamp('2026-11-02 14:05:00'), '2 Nov, 2:05pm');
  assert.equal(shortStamp('2026-11-02 00:30:00'), '2 Nov, 12:30am');
  assert.equal(shortStamp('2026-11-02 12:00:00'), '2 Nov, 12:00pm');
  assert.equal(shortStamp(''), '');
  assert.equal(rsvpStateText({ rsvpOpen: true, open: true, deadline: '2026-11-06' }), 'RSVP open until 6 Nov');
  assert.equal(rsvpStateText({ rsvpOpen: true, open: false, deadline: '2026-11-06' }), 'RSVP closed · the deadline (6 Nov) has passed');
  assert.equal(rsvpStateText({ rsvpOpen: false, open: false, deadline: '2026-11-06' }), 'RSVP closed');
});

test('countByStatus and sharedReplies', () => {
  const guests = [{ status: 'replied' }, { status: 'opened' }, { status: 'not_opened' }, { status: 'not_opened' }];
  assert.deepEqual(countByStatus(guests), { all: 4, not_opened: 2, opened: 1, replied: 1 });
  const responses = [{ source: 'vip', name: 'a' }, { source: 'shared', name: 'b' }, { source: 'shared', name: 'c' }];
  assert.deepEqual(sharedReplies(responses).map((r) => r.name), ['c', 'b']);
  assert.equal(responses.length, 3);
});

test('paginate: slices, clamps, reports the range', () => {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: String(i) }));
  const p2 = paginate(items, 2, 25);
  assert.deepEqual([p2.items[0].id, p2.items.length, p2.page, p2.pageCount, p2.from, p2.to, p2.total], ['25', 25, 2, 40, 26, 50, 1000]);
  assert.equal(paginate(items, 99, 25).page, 40);
  assert.equal(paginate(items, 0, 25).page, 1);
  assert.deepEqual(paginate(items.slice(0, 7), 1, 25).to, 7);
  assert.deepEqual([paginate([], 3, 25).page, paginate([], 3, 25).from, paginate([], 3, 25).pageCount], [1, 0, 1]);
});

test('pageOf: finds the page holding an id', () => {
  const items = Array.from({ length: 60 }, (_, i) => ({ id: `g${i}` }));
  assert.equal(pageOf(items, 'g0', 25), 1);
  assert.equal(pageOf(items, 'g25', 25), 2);
  assert.equal(pageOf(items, 'g59', 25), 3);
  assert.equal(pageOf(items, 'nope', 25), 0);
});

test('responseTotals: everyone, then invited guests and the public link apart', () => {
  const guests = [{ status: 'replied' }, { status: 'not_opened' }, { status: 'opened' }];
  const responses = [
    { source: 'vip', attending: 'yes', pax: 3 },
    { source: 'shared', attending: 'yes', pax: 2 },
    { source: 'shared', attending: 'no', pax: 0 },
  ];
  assert.deepEqual(responseTotals(guests, responses), {
    all: { replies: 3, coming: 5, declined: 1 },
    guests: { replies: 1, coming: 3, declined: 0, invited: 3, notOpened: 1 },
    public: { replies: 2, coming: 2, declined: 1 },
  });
  assert.deepEqual(responseTotals([], []).all, { replies: 0, coming: 0, declined: 0 });
});

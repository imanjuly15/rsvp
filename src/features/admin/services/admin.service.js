/*
 * Admin page rules. No React, no fetch: it calls only the api layer.
 * Session keeping, form checks, list filtering and the one error-to-message mapping live here.
 */
import { ApiError } from '../../rsvp/shared.js';
import * as adminApi from '../api/adminApi.js';
import { ADMIN_MESSAGE, LIMITS, SESSION_STORAGE_KEY, STATUS, STATUS_FILTER_ALL } from '../constants/admin.constants.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { phoneDigits } from '../utils/admin.utils.js';

/** @typedef {{ name: string, pax: string|number, phone: string }} GuestForm  what is typed (pax may still be text) */
/** @typedef {{ name?: string, pax?: string, phone?: string }} GuestFormErrors */
/** @typedef {{ ok: true, data: Object } | { ok: false, sessionExpired: boolean, message: string }} Outcome */

/* ---------- session (this browser tab only) ---------- */

/** @returns {string} the saved token, or "" if none or expired */
export function readSession(storage = globalThis.sessionStorage, now = Date.now()) {
  try {
    const saved = JSON.parse(storage.getItem(SESSION_STORAGE_KEY) || 'null');
    return saved && typeof saved.token === 'string' && saved.expiresAt > now ? saved.token : '';
  } catch {
    return '';
  }
}

export function saveSession(token, expiresInSeconds, storage = globalThis.sessionStorage, now = Date.now()) {
  try {
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token, expiresAt: now + expiresInSeconds * 1000 }));
  } catch {
    // Storage blocked: the session still works until the page reloads.
  }
}

export function clearSession(storage = globalThis.sessionStorage) {
  try {
    storage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/* ---------- errors ---------- */

/**
 * The one mapping from an error to what the admin sees.
 * @returns {{ sessionExpired: boolean, message: string }}
 */
export function mapAdminError(err) {
  if (err instanceof ApiError) {
    return { sessionExpired: err.message === ADMIN_MESSAGE.SESSION, message: err.message || S.networkError };
  }
  return { sessionExpired: false, message: S.networkError };
}

/** Runs one api call and turns the result into an Outcome. Never throws. */
async function attempt(promiseFactory) {
  try {
    return { ok: true, data: await promiseFactory() };
  } catch (err) {
    return { ok: false, ...mapAdminError(err) };
  }
}

/* ---------- actions ---------- */

/**
 * Checks the key with the script and saves the session.
 * @param {string} key
 * @returns {Promise<{ ok: true, token: string } | { ok: false, message: string }>} never throws
 */
export async function logIn(key, { api = adminApi } = {}) {
  const trimmed = String(key || '').trim();
  if (!trimmed) return { ok: false, message: S.needKey };
  const out = await attempt(() => api.login(trimmed));
  if (!out.ok) return { ok: false, message: out.message };
  saveSession(out.data.token, out.data.expiresInSeconds);
  return { ok: true, token: out.data.token };
}

/** @returns {Promise<Outcome>} data is the Overview */
export const loadOverview = (token, { api = adminApi } = {}) => attempt(() => api.getOverview(token));

/**
 * Client checks for the guest form (the script checks again).
 * @param {GuestForm} form
 * @returns {{ errors: GuestFormErrors, guest: import('../api/adminApi.js').GuestInput|null }}
 */
export function checkGuestForm(form) {
  const errors = {};
  const name = String(form.name || '').trim();
  if (!name) errors.name = S.needName;
  const pax = Number(String(form.pax).trim());
  if (!Number.isInteger(pax) || pax < LIMITS.PAX_MIN || pax > LIMITS.PAX_MAX) errors.pax = S.badPax;
  const phone = phoneDigits(form.phone);
  const digitsOk = new RegExp(`^\\d{${LIMITS.PHONE_MIN_DIGITS},${LIMITS.PHONE_MAX_DIGITS}}$`).test(phone);
  if (phone && (!digitsOk || phone.startsWith('0'))) errors.phone = S.badPhone;
  return { errors, guest: Object.keys(errors).length ? null : { name, pax, phone } };
}

/**
 * Adds a guest (no id) or updates one (with id). The ID is always made by the script.
 * @param {string} token
 * @param {import('../api/adminApi.js').GuestInput} guest  from checkGuestForm
 * @param {string|null} id
 * @returns {Promise<Outcome>}
 */
export function saveGuest(token, guest, id, { api = adminApi } = {}) {
  return attempt(() => (id ? api.updateGuest(token, { id, ...guest }) : api.addGuest(token, guest)));
}

/** @returns {Promise<Outcome>} */
export const setRsvpOpen = (token, open, { api = adminApi } = {}) => attempt(() => api.setConfig(token, { rsvpOpen: open }));

/** @returns {Promise<Outcome>} */
export const setDeadline = (token, deadline, { api = adminApi } = {}) => attempt(() => api.setConfig(token, { deadline }));

/* ---------- list ---------- */

/**
 * One page of a list. The page number is clamped, so a shrinking list never shows an empty page.
 * @returns {{ items: Array, page: number, pageCount: number, from: number, to: number, total: number }}
 */
export function paginate(items, page, size) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), page: current, pageCount, from: total ? start + 1 : 0, to: Math.min(start + size, total), total };
}

/** The page (1-based) holding the item with this id, or 0 if it is not in the list. */
export function pageOf(items, id, size) {
  const index = items.findIndex((item) => item.id === id);
  return index < 0 ? 0 : Math.floor(index / size) + 1;
}

/** How many guests are in each status, for the filter chips. */
export function countByStatus(guests) {
  const counts = { [STATUS_FILTER_ALL]: guests.length, [STATUS.NOT_OPENED]: 0, [STATUS.OPENED]: 0, [STATUS.REPLIED]: 0 };
  guests.forEach((g) => { counts[g.status] += 1; });
  return counts;
}

/**
 * Reply totals for everyone, and split by where the reply came from: invited guests (personal links)
 * and the public link. "coming" is the sum of pax of yes replies.
 */
export function responseTotals(guests, responses) {
  const sum = (list) => ({
    replies: list.length,
    coming: list.filter((r) => r.attending === 'yes').reduce((total, r) => total + r.pax, 0),
    declined: list.filter((r) => r.attending !== 'yes').length,
  });
  return {
    all: sum(responses),
    guests: { ...sum(responses.filter((r) => r.source === 'vip')), invited: guests.length, notOpened: guests.filter((g) => g.status === STATUS.NOT_OPENED).length },
    public: sum(responses.filter((r) => r.source === 'shared')),
  };
}

/** Replies that came through the public link, newest first (personal replies show on each guest's row). */
export const sharedReplies = (responses) => responses.filter((r) => r.source === 'shared').reverse();

/**
 * Guests matching the search text (name or phone) and status filter.
 * @param {import('../api/adminApi.js').AdminGuest[]} guests
 */
export function filterGuests(guests, query, status) {
  const q = String(query || '').trim().toLowerCase();
  const digits = phoneDigits(q);
  return guests.filter((g) => {
    if (status !== STATUS_FILTER_ALL && g.status !== status) return false;
    if (!q) return true;
    return g.name.toLowerCase().includes(q) || (digits.length > 2 && g.phone.includes(digits));
  });
}

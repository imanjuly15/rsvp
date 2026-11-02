/* Thin admin endpoint functions. Every call is a POST, so the key and token never appear in a URL. */
import { fetchPost, NetworkError, RSVP_CONFIG, withBusyRetry } from '../../rsvp/shared.js';
import { ADMIN_ACTION, OP } from '../constants/admin.constants.js';

/**
 * @typedef {Object} AdminGuest
 * @property {string} id
 * @property {string} name
 * @property {number} pax          guests allowed
 * @property {string} phone        digits, or ""
 * @property {string} link         personal link, "" until site_url is set
 * @property {string} whatsappUrl  wa.me link with the message, "" until site_url is set
 * @property {string} firstOpened  "YYYY-MM-DD HH:mm:ss" or ""
 * @property {{ attending: 'yes'|'no', pax: number, note: string, updated: string }|null} reply
 * @property {'replied'|'opened'|'not_opened'} status
 */
/**
 * @typedef {Object} AdminResponse  one row of the Responses tab
 * @property {string} timestamp
 * @property {string} guestId  "" for shared-link replies
 * @property {string} name
 * @property {'yes'|'no'} attending
 * @property {number} pax
 * @property {string} note
 * @property {'vip'|'shared'} source
 * @property {boolean} verified
 * @property {string} updated
 * @property {string} phone
 */
/**
 * @typedef {Object} Overview
 * @property {{ eventTitle: string, deadline: string, rsvpOpen: boolean, open: boolean, sharedMaxPax: number, siteUrl: string, sharedLink: string, sharedWhatsappUrl: string }} settings
 * @property {{ invited: number, replied: number, notOpened: number, attendingReplies: number, declinedReplies: number, peopleComing: number, sharedReplies: number }} summary
 * @property {AdminGuest[]} guests
 * @property {AdminResponse[]} responses
 */
/** @typedef {{ name: string, pax: number, phone: string }} GuestInput */

const live = {
  post(body) {
    if (!RSVP_CONFIG.scriptUrl) return Promise.reject(new NetworkError('VITE_RSVP_SCRIPT_URL is not set'));
    return fetchPost(RSVP_CONFIG.scriptUrl, body);
  },
};

// The mock is loaded only when switched on, so a live build never downloads it.
const backend = async () => (RSVP_CONFIG.useMock ? (await import('../mocks/adminMock.js')).adminMock : live);

const call = (op, fields) => withBusyRetry(async () => (await backend()).post({ action: ADMIN_ACTION, op, ...fields }));

/** @returns {Promise<{ token: string, expiresInSeconds: number }>} @throws {ApiError} wrong key, locked, not set up  @throws {NetworkError} */
export const login = (key) => call(OP.LOGIN, { key });

/** @returns {Promise<Overview>} @throws {ApiError} session expired  @throws {NetworkError} */
export const getOverview = (token) => call(OP.OVERVIEW, { token });

/** @param {GuestInput} guest  @returns {Promise<{ id: string }>} the new guest's ID  @throws {ApiError}  @throws {NetworkError} */
export const addGuest = (token, guest) => call(OP.ADD_GUEST, { token, ...guest });

/** @param {GuestInput & { id: string }} guest  @returns {Promise<{ id: string }>}  @throws {ApiError}  @throws {NetworkError} */
export const updateGuest = (token, guest) => call(OP.UPDATE_GUEST, { token, ...guest });

/** @param {{ rsvpOpen?: boolean, deadline?: string }} changes  @throws {ApiError}  @throws {NetworkError} */
export const setConfig = (token, changes) => call(OP.SET_CONFIG, { token, ...changes });

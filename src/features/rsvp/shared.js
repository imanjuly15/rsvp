/*
 * Second public entry, for other features that talk to the same Apps Script (the admin page).
 * Network pieces only, no UI, so importing it never pulls the guest page into another bundle.
 */
export { RSVP_CONFIG } from './config/rsvp.config.js';
export { ApiError, NetworkError } from './api/errors.js';
export { fetchPost, withBusyRetry } from './api/httpClient.js';
export { isSafeHttpsUrl } from './utils/rsvp.utils.js';

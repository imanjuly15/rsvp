/* Fixed values for the admin page. Imports nothing. */

export const ADMIN_ACTION = 'admin';

export const OP = {
  LOGIN: 'login',
  OVERVIEW: 'overview',
  ADD_GUEST: 'addGuest',
  UPDATE_GUEST: 'updateGuest',
  SET_CONFIG: 'setConfig',
};

/** Exact messages from apps-script/Code.gs that the page reacts to. */
export const ADMIN_MESSAGE = {
  SESSION: 'Session expired. Please log in again',
};

/** Guest status codes returned by the overview. */
export const STATUS = { REPLIED: 'replied', OPENED: 'opened', NOT_OPENED: 'not_opened' };
export const STATUS_FILTER_ALL = 'all';

/** Same limits as Code.gs (MAX_NAME, MAX_PAX_CEILING, phone rule). The script checks again. */
export const LIMITS = { NAME_MAX: 120, PAX_MIN: 1, PAX_MAX: 20, PHONE_MIN_DIGITS: 8, PHONE_MAX_DIGITS: 15 };

/** Where the session token is kept: this browser tab only, gone when the tab closes. */
export const SESSION_STORAGE_KEY = 'rsvp-admin-session';

/** How long the "Copied" confirmation stays on a button. */
export const COPIED_MS = 2000;

/** How long a just-added or just-edited guest row stays highlighted. */
export const HIGHLIGHT_MS = 4000;

/** Coming back to the tab reloads the data if the last load is older than this. */
export const AUTO_REFRESH_AFTER_MS = 30 * 1000;

/** From this width the guest list is a table; below it, compact rows that open for details. Keep in step with admin.css. */
export const TABLE_MEDIA_QUERY = '(min-width: 860px)';

/** Guests shown per page in the list. */
export const GUESTS_PER_PAGE = 15;

/** Order of the filter chips. */
export const FILTER_ORDER = [STATUS_FILTER_ALL, STATUS.NOT_OPENED, STATUS.OPENED, STATUS.REPLIED];

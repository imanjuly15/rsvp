import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTO_REFRESH_AFTER_MS, GUESTS_PER_PAGE, HIGHLIGHT_MS, STATUS_FILTER_ALL } from '../constants/admin.constants.js';
import { countByStatus, filterGuests, loadOverview, pageOf, paginate, responseTotals, saveGuest, setDeadline, setRsvpOpen, sharedReplies } from '../services/admin.service.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate } from '../utils/admin.utils.js';

/**
 * The dashboard's data and actions. Any "session expired" answer logs out through onSessionExpired.
 * After every change the overview is loaded again, so the page always matches the Sheet. It also
 * reloads by itself when the tab comes back into view.
 */
export function useAdminData(token, onSessionExpired) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [guestNotice, setGuestNotice] = useState('');
  const [highlightId, setHighlightId] = useState('');
  const lastLoad = useRef(0);

  const expired = useCallback((out) => {
    if (!out.ok && out.sessionExpired) onSessionExpired(out.message);
    return !out.ok && out.sessionExpired;
  }, [onSessionExpired]);

  const refresh = useCallback(async () => {
    lastLoad.current = Date.now();
    setRefreshing(true);
    setError('');
    const out = await loadOverview(token);
    setRefreshing(false);
    if (expired(out)) return;
    if (!out.ok) {
      setError(out.message);
      return;
    }
    setData(out.data);
    setUpdatedAt(new Date());
  }, [token, expired]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Back on the tab after a while (for example after sending WhatsApp messages): fetch fresh numbers.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastLoad.current > AUTO_REFRESH_AFTER_MS) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = setTimeout(() => setHighlightId(''), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightId]);

  /** Runs a change, then reloads. @returns {Promise<string>} an error message, or "" on success */
  async function change(run, onSuccess) {
    const out = await run();
    if (expired(out)) return '';
    if (!out.ok) return out.message;
    onSuccess(out.data || {});
    await refresh();
    return '';
  }

  const shared = useMemo(() => (data ? sharedReplies(data.responses) : []), [data]);
  const totals = useMemo(() => (data ? responseTotals(data.guests, data.responses) : null), [data]);

  return {
    data,
    sharedReplies: shared,
    totals,
    error,
    refreshing,
    updatedAt,
    guestNotice,
    highlightId,
    refresh,
    saveGuest: (guest, id) => {
      setGuestNotice('');
      return change(() => saveGuest(token, guest, id), (result) => {
        setGuestNotice(fillTemplate(id ? S.guestSaved : S.guestAdded, { name: guest.name }));
        setHighlightId(result.id || id || '');
      });
    },
    /** These two report success through their own panel, so they only return the error text. */
    setOpen: (open) => change(() => setRsvpOpen(token, open), () => {}),
    setDeadline: (deadline) => change(() => setDeadline(token, deadline), () => {}),
  };
}

/** A page at a time of any list (15 per page, like the guests). */
export function usePagedList(items) {
  const [page, setPage] = useState(1);
  const paging = useMemo(() => paginate(items, page, GUESTS_PER_PAGE), [items, page]);
  return { paging, setPage };
}

/**
 * Search, status filter and paging for the guest list, plus the count behind each filter tab.
 * A new search or tab starts again at page 1; a just-saved guest's page is shown so its row is visible.
 */
export function useGuestFilter(guests, highlightId) {
  const [query, setQueryRaw] = useState('');
  const [status, setStatusRaw] = useState(STATUS_FILTER_ALL);
  const [page, setPage] = useState(1);
  const counts = useMemo(() => countByStatus(guests), [guests]);
  const matching = useMemo(() => filterGuests(guests, query, status), [guests, query, status]);
  const paged = useMemo(() => paginate(matching, page, GUESTS_PER_PAGE), [matching, page]);

  useEffect(() => {
    const target = highlightId ? pageOf(matching, highlightId, GUESTS_PER_PAGE) : 0;
    if (target) setPage(target);
  }, [highlightId, matching]);

  const setQuery = (q) => { setQueryRaw(q); setPage(1); };
  const setStatus = (s) => { setStatusRaw(s); setPage(1); };
  const reset = () => { setQueryRaw(''); setStatusRaw(STATUS_FILTER_ALL); setPage(1); };
  return { query, setQuery, status, setStatus, counts, visible: paged.items, paging: paged, setPage, reset };
}

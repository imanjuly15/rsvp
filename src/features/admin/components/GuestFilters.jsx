import { FILTER_ORDER, STATUS_FILTER_ALL } from '../constants/admin.constants.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { statusText } from '../utils/admin.utils.js';

/** Status tabs with counts (they wrap, never scroll sideways) and the search box. `filter` comes from useGuestFilter. */
export default function GuestFilters({ filter }) {
  return (
    <div className="toolbar">
      <div className="tabs" role="group" aria-label={S.filterGroup}>
        {FILTER_ORDER.map((status) => (
          <button key={status} type="button" className="tab" aria-pressed={filter.status === status} onClick={() => filter.setStatus(status)}>
            {status === STATUS_FILTER_ALL ? S.filterAll : statusText(status)}
            <span className="tab-count">{filter.counts[status]}</span>
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="guest-search" className="sr-only">{S.searchLabel}</label>
        <input id="guest-search" className="input" type="search" placeholder={S.searchPlaceholder} autoComplete="off" value={filter.query} onChange={(e) => filter.setQuery(e.target.value)} />
      </div>
    </div>
  );
}

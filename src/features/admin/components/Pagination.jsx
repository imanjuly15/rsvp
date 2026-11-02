import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate } from '../utils/admin.utils.js';

const num = (n) => n.toLocaleString('en');

/**
 * "Showing 26–50 of 1,000" with Previous / Page x of y / Next. Hidden when everything fits on one page.
 * @param {{ paging: { page: number, pageCount: number, from: number, to: number, total: number }, onPage: (page: number) => void }} props
 */
export default function Pagination({ paging, onPage }) {
  if (paging.pageCount <= 1) return null;
  return (
    <nav className="pager" aria-label={S.pagesLabel}>
      <p className="pager-range">{fillTemplate(S.showing, { from: num(paging.from), to: num(paging.to), total: num(paging.total) })}</p>
      <div className="pager-buttons">
        <button type="button" className="btn btn-secondary" disabled={paging.page <= 1} onClick={() => onPage(paging.page - 1)}>{S.previous}</button>
        <span className="pager-page" aria-current="page">{fillTemplate(S.pageOf, { page: num(paging.page), count: num(paging.pageCount) })}</span>
        <button type="button" className="btn btn-secondary" disabled={paging.page >= paging.pageCount} onClick={() => onPage(paging.page + 1)}>{S.next}</button>
      </div>
    </nav>
  );
}

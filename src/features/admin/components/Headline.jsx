import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate } from '../utils/admin.utils.js';

const num = (n) => n.toLocaleString('en');

/**
 * Totals for everyone first (people coming leads: it is the number the caterer needs), then the same
 * numbers split by where the reply came from, so invited guests and the public link are never mixed up.
 * @param {{ totals: ReturnType<typeof import('../services/admin.service.js').responseTotals> }} props
 */
export default function Headline({ totals }) {
  const { all, guests, public: pub } = totals;
  return (
    <section className="card" aria-labelledby="overview-title">
      <h2 id="overview-title">{S.overviewTitle}</h2>
      <p className="card-sub">{S.totalsAll}</p>
      <dl className="stats">
        <div className="stat-main">
          <dt className="stat-label">{all.coming === 1 ? S.totalComingOne : S.totalComingMany}</dt>
          <dd className="stat-value">{num(all.coming)}</dd>
        </div>
        <div>
          <dt className="stat-label">{S.totalReplies}</dt>
          <dd className="stat-value">{num(all.replies)}</dd>
        </div>
        <div>
          <dt className="stat-label">{S.totalDeclined}</dt>
          <dd className="stat-value">{num(all.declined)}</dd>
        </div>
      </dl>

      <table className="breakdown">
        <thead>
          <tr>
            <th scope="col">{S.breakdownSource}</th>
            <th scope="col">{S.breakdownReplies}</th>
            <th scope="col">{S.breakdownComing}</th>
            <th scope="col">{S.breakdownDeclined}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{S.fromGuests}</th>
            <td>{fillTemplate(S.repliedOf, { replied: num(guests.replies), invited: num(guests.invited) })}</td>
            <td>{num(guests.coming)}</td>
            <td>{num(guests.declined)}</td>
          </tr>
          <tr>
            <th scope="row">{S.fromPublic}</th>
            <td>{num(pub.replies)}</td>
            <td>{num(pub.coming)}</td>
            <td>{num(pub.declined)}</td>
          </tr>
        </tbody>
      </table>
      {guests.notOpened > 0 && (
        <p className="stats-note">{guests.notOpened === 1 ? S.notOpenedOne : fillTemplate(S.notOpenedMany, { n: num(guests.notOpened) })}</p>
      )}
    </section>
  );
}

import { useAdminData } from '../hooks/useAdminData.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { clockTime, fillTemplate, rsvpStateText } from '../utils/admin.utils.js';
import GuestList from './GuestList.jsx';
import Headline from './Headline.jsx';
import SettingsPanel from './SettingsPanel.jsx';
import SharedLinkPanel from './SharedLinkPanel.jsx';

/**
 * Everything after login, in the order the host works: overview, guests (daily), shared link,
 * then settings (rare). The top bar stays on screen while scrolling. Data and actions come from useAdminData.
 */
export default function Dashboard({ token, onLogOut }) {
  const admin = useAdminData(token, onLogOut);
  const { data } = admin;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <h1 className="topbar-title">{(data && data.settings.eventTitle) || S.pageTitle}</h1>
          {data && (
            <p className="topbar-sub">
              <span className={`badge ${data.settings.open ? 'badge-ok' : 'badge-danger'}`}>{rsvpStateText(data.settings)}</span>
              {admin.updatedAt && <span>{fillTemplate(S.updatedAt, { time: clockTime(admin.updatedAt) })}</span>}
            </p>
          )}
          <div className="topbar-tools">
            <button type="button" className="btn btn-ghost" onClick={admin.refresh} disabled={admin.refreshing}>
              {admin.refreshing ? S.refreshing : S.refresh}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onLogOut('')}>{S.logOut}</button>
          </div>
        </div>
      </header>

      <div className="content">
        {!data && !admin.error && <p className="loading" role="status">{S.loading}</p>}
        {admin.error && (
          <div className="card">
            <p className="err" role="alert">{admin.error}</p>
            <div className="actions"><button type="button" className="btn btn-primary" onClick={admin.refresh}>{S.tryAgain}</button></div>
          </div>
        )}
        {data && (
          <>
            <Headline totals={admin.totals} />
            <GuestList guests={data.guests} hasSiteUrl={Boolean(data.settings.siteUrl)} notice={admin.guestNotice} highlightId={admin.highlightId} onSave={admin.saveGuest} />
            <SharedLinkPanel settings={data.settings} replies={admin.sharedReplies} />
            <SettingsPanel settings={data.settings} onSetOpen={admin.setOpen} onSetDeadline={admin.setDeadline} />
          </>
        )}
      </div>
    </>
  );
}

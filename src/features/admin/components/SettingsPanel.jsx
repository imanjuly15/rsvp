import { useState } from 'react';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { rsvpStateText } from '../utils/admin.utils.js';

/**
 * Deadline and the open/close switch, folded at the bottom because they are rarely used.
 * Closing asks for an inline confirmation (no browser pop-up): it affects every guest at once.
 */
export default function SettingsPanel({ settings, onSetOpen, onSetDeadline }) {
  const [deadline, setDeadline] = useState(settings.deadline);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  async function run(action, successText) {
    setBusy(true);
    setError('');
    setSaved('');
    const message = await action();
    setBusy(false);
    setConfirming(false);
    if (message) setError(message);
    else setSaved(successText);
  }

  return (
    <details className="card">
      <summary>
        <h2>{S.settingsTitle}</h2>
        <span className="card-sub admin-state-line">{rsvpStateText(settings)}</span>
      </summary>
      {settings.rsvpOpen && !settings.open && <p className="hint">{S.passedHint}</p>}

      <div className="settings-row deadline-row">
        <div className="field">
          <label htmlFor="admin-deadline">{S.deadlineLabel}</label>
          <input id="admin-deadline" className="input" type="date" value={deadline} aria-describedby="hint-deadline" onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <button type="button" className="btn btn-secondary" disabled={busy || !deadline || deadline === settings.deadline} onClick={() => run(() => onSetDeadline(deadline), S.deadlineSaved)}>
          {S.saveDeadline}
        </button>
      </div>
      <p className="hint" id="hint-deadline">{S.deadlineHint}</p>

      <div className="settings-row">
        {settings.rsvpOpen && !confirming && (
          <button type="button" className="btn btn-danger-outline" disabled={busy} onClick={() => setConfirming(true)}>{S.closeRsvp}</button>
        )}
        {settings.rsvpOpen && confirming && (
          <div className="confirm" role="group" aria-labelledby="close-confirm">
            <p id="close-confirm">{S.closeConfirm}</p>
            <div className="actions">
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => run(() => onSetOpen(false), S.rsvpClosedSaved)}>
                {busy ? S.saving : S.closeConfirmButton}
              </button>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setConfirming(false)}>{S.cancel}</button>
            </div>
          </div>
        )}
        {!settings.rsvpOpen && (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => onSetOpen(true), S.rsvpOpenedSaved)}>
            {busy ? S.saving : S.openRsvp}
          </button>
        )}
      </div>

      <p className="notice" role="status">{saved}</p>
      {error && <p className="err" role="alert">{error}</p>}
    </details>
  );
}

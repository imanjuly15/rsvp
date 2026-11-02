import { useEffect, useState } from 'react';
import { COPIED_MS } from '../constants/admin.constants.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate } from '../utils/admin.utils.js';
import WhatsAppButton from './WhatsAppButton.jsx';

/**
 * WhatsApp and Copy link buttons for one link. `primary` makes WhatsApp the green main button
 * (for guests who still need a message). Anything in `children` follows in the same row.
 */
export default function LinkActions({ className = 'actions', link, whatsappUrl, whatsappLabel = S.whatsapp, primary, children }) {
  const [copy, setCopy] = useState('idle');

  useEffect(() => {
    if (copy !== 'copied') return undefined;
    const timer = setTimeout(() => setCopy('idle'), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copy]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
  }

  return (
    <>
      <div className={className}>
        <WhatsAppButton url={whatsappUrl} className={`btn ${primary ? 'btn-send' : 'btn-secondary'}`} label={whatsappLabel} />
        {link && <button type="button" className="btn btn-secondary" onClick={copyLink}>{copy === 'copied' ? S.copied : S.copyLink}</button>}
        {children}
      </div>
      <span className="sr-only" role="status">{copy === 'copied' ? S.copied : ''}</span>
      {copy === 'failed' && <p className="err copy-failed" role="alert">{fillTemplate(S.copyFailed, { link })}</p>}
    </>
  );
}

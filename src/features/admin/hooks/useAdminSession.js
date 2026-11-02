import { useCallback, useState } from 'react';
import { clearSession, logIn, readSession } from '../services/admin.service.js';

/** Who is logged in (a session token in this tab), plus log in / log out. */
export function useAdminSession() {
  const [token, setToken] = useState(() => readSession());
  const [notice, setNotice] = useState('');
  const [checking, setChecking] = useState(false);

  /** @returns {Promise<string>} an error message, or "" when logged in */
  async function submitKey(key) {
    if (checking) return '';
    setChecking(true);
    const out = await logIn(key);
    setChecking(false);
    if (!out.ok) return out.message;
    setNotice('');
    setToken(out.token);
    return '';
  }

  const logOut = useCallback((message = '') => {
    clearSession();
    setToken('');
    setNotice(message);
  }, []);

  return { token, notice, checking, submitKey, logOut };
}

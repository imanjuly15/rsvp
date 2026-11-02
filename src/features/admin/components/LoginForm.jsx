import { useState } from 'react';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import Field from './Field.jsx';

/** Asks for the admin key. `session` comes from useAdminSession(). */
export default function LoginForm({ session }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError(await session.submitKey(key));
  }

  return (
    <div className="login">
      <section className="card" aria-labelledby="admin-title">
        <h1 id="admin-title">{S.pageTitle}</h1>
        {session.notice && <p className="err" role="alert">{session.notice}</p>}
        <form onSubmit={onSubmit} noValidate>
          <Field id="admin-key" type="password" label={S.keyLabel} hint={S.keyHint} error={error} autoComplete="off" spellCheck={false} value={key} onChange={setKey} />
          <button className="btn btn-primary btn-block" type="submit" disabled={session.checking}>{session.checking ? S.loggingIn : S.logIn}</button>
        </form>
      </section>
    </div>
  );
}

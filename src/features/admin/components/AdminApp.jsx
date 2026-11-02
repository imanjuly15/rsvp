import { useAdminSession } from '../hooks/useAdminSession.js';
import Dashboard from './Dashboard.jsx';
import LoginForm from './LoginForm.jsx';

/** The whole admin page: the login form until there is a session, then the dashboard. */
export default function AdminApp() {
  const session = useAdminSession();
  return (
    <main>
      {session.token ? <Dashboard token={session.token} onLogOut={session.logOut} /> : <LoginForm session={session} />}
    </main>
  );
}

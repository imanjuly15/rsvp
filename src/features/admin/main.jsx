// Entry of admin.html. The admin page has its own look (admin.css) and never loads the guest site's styles.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './admin.css';
import AdminApp from './components/AdminApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);

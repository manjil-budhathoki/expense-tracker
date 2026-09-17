import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import WishlistPage from './pages/WishlistPage';
import RentPage from './pages/RentPage';
import AuthScreen from './components/AuthScreen';
import { useEffect, useState } from 'react';
import { get, getToken, post, setToken } from './utils/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  useEffect(() => {
    if (getToken()) get('/v1/auth/me').then(setUser).catch(() => setToken(null)).finally(() => setChecking(false));
    const expired = () => setUser(null);
    window.addEventListener('paisa-session-expired', expired);
    return () => window.removeEventListener('paisa-session-expired', expired);
  }, []);
  const logout = async () => {
    try { await post('/v1/auth/logout', {}); } finally { setToken(null); setUser(null); }
  };
  if (checking) return <div className="auth-page">Checking your session…</div>;
  if (!user) return <AuthScreen onSuccess={result => { setToken(result.token); setUser(result.user); }} />;
  return (
    <FinanceProvider key={user.id}>
      <BrowserRouter>
        <Layout user={user} onLogout={logout}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/rent" element={<RentPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </FinanceProvider>
  );
}

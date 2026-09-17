import Navbar from './Navbar';
import { useFinance } from '../../context/FinanceContext';
export default function Layout({ children, user, onLogout }) {
  const { expensesLoading, expensesError, saveError, saving } = useFinance();
  return <div className="app-shell"><a className="skip-link" href="#main">Skip to content</a><Navbar user={user} onLogout={onLogout} />
    <main id="main" className="app-main">
      {expensesLoading ? <div className="empty-state" role="status">Loading your finances…</div> : expensesError ? <div className="error-banner" role="alert"><strong>We couldn’t load your finances.</strong><p>{expensesError}</p><button onClick={() => window.location.reload()}>Try again</button></div> : <>
        <div aria-live="polite">{saving && <p className="save-status">Saving changes…</p>}{saveError && <div className="error-banner" role="alert">Changes weren’t saved: {saveError}</div>}</div>
        {children}</>}
      <footer className="app-footer">Paisa · Make room for what matters.<span>All amounts in Nepalese rupees</span></footer>
    </main></div>;
}

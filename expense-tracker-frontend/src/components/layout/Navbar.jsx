import { NavLink } from 'react-router-dom';
import { Wallet, LayoutDashboard, ArrowLeftRight, Target, House } from 'lucide-react';

const links = [['/', 'Overview', LayoutDashboard], ['/expenses', 'Transactions', ArrowLeftRight], ['/wishlist', 'Savings goals', Target], ['/rent', 'Rent & bills', House]];
export default function Navbar() {
  return <header className="app-header">
    <div className="brand"><span className="brand-icon"><Wallet size={23} /></span><div>Paisa<span className="text-emerald-600">.</span><small>A little clarity. Every day.</small></div></div>
    <nav aria-label="Main navigation" className="main-nav">{links.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    <span className="currency-badge">NPR <span>Personal finance</span></span>
  </header>;
}

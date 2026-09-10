import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Wallet, Target, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatNPR } from '../utils/currency';

export default function DashboardPage() {
  const { expenses, categories, wishlistPots, monthlySalary, setMonthlySalary, allocationPercent, setAllocationPercent, saving } = useFinance();
  const [salary, setSalary] = useState(monthlySalary);
  const [allocation, setAllocation] = useState(allocationPercent);
  const month = new Date().toLocaleDateString('en-CA').slice(0, 7);
  const monthly = expenses.filter(e => e.date.startsWith(month) && e.type === 'expense');
  const spent = monthly.reduce((s,e) => s + e.amount, 0);
  const saved = wishlistPots.reduce((s,p) => s + p.currentSaved, 0);
  const breakdown = categories.map(c => ({ ...c, total: monthly.filter(e => e.category_id === c.id).reduce((s,e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a,b) => b.total-a.total);
  const recent = [...expenses].sort((a,b) => b.date.localeCompare(a.date) || b.id-a.id).slice(0,5);
  return <div className="space-y-7">
    <div className="page-heading"><div><p className="eyebrow">YOUR MONEY, AT A GLANCE</p><h1>A clearer picture.</h1><p>Small steps today. More possibilities tomorrow.</p></div><Link className="primary-button" to="/expenses"><Plus size={17}/> Add transaction</Link></div>
    <section className="overview-hero"><div><p className="eyebrow">{new Date().toLocaleDateString('en-US', {month:'long',year:'numeric'})} · MONTHLY OVERVIEW</p><h2>{formatNPR(monthlySalary - spent)}</h2><p>Salary remaining after tracked expenses</p><div className="hero-meter"><div style={{width:`${monthlySalary > 0 ? Math.min(100,spent/monthlySalary*100) : 0}%`}}/></div><small>{monthlySalary > 0 ? `${Math.round(spent/monthlySalary*100)}% of monthly salary spent` : 'Set your salary below to start planning'}</small></div><div className="hero-note"><Wallet size={32}/><p>A plan for your money.<br/>Space for your dreams.</p><span>Track • Plan • Grow</span></div></section>
    <section className="metric-grid">{[[ArrowUpRight,'Monthly salary',monthlySalary,'Your planning baseline'],[ArrowDownLeft,'Spent this month',spent,`${monthly.length} expense transactions`],[Target,'Saved in goals',saved,`${wishlistPots.length} savings pots`]].map(([Icon,label,amount,note]) => <div className="metric-card" key={label}><span className="metric-icon"><Icon size={20}/></span><p>{label}</p><h2>{formatNPR(amount)}</h2><small>{note}</small></div>)}</section>
    <div className="dashboard-grid"><section className="panel"><div className="section-heading"><h2>Recent transactions</h2><Link to="/expenses">View all ↗</Link></div>{recent.length ? recent.map(e => <div className="transaction-row" key={e.id}><span className="transaction-icon"><ArrowDownLeft size={18}/></span><div className="transaction-description"><strong>{e.note || 'Transaction'}</strong><small>{categories.find(c=>c.id===e.category_id)?.name || 'Other'} · {e.date}</small></div><strong className={e.type==='saving'?'text-emerald-700':''}>{e.type==='saving'?'+':'−'}{formatNPR(e.amount)}</strong></div>) : <div className="empty-state">Your story starts with one transaction.<Link to="/expenses">Add your first transaction →</Link></div>}</section>
    <section className="panel"><div className="section-heading"><h2>Where it goes</h2><span>This month</span></div>{breakdown.length ? breakdown.map(c => <div className="category-bar" key={c.id}><div><span>{c.name}</span><strong>{formatNPR(c.total)}</strong></div><div className="bar-track"><div style={{width:`${c.total/spent*100}%`}}/></div></div>) : <div className="empty-state">Your spending breakdown will appear here.</div>}</section></div>
    <section className="panel"><div className="section-heading"><div><h2>Your monthly plan</h2><p>Set an income baseline and a savings target.</p></div></div><form className="budget-form" onSubmit={async e => {e.preventDefault(); if(await setMonthlySalary(Number(salary))) await setAllocationPercent(Number(allocation));}}><label>Monthly salary (NPR)<input required type="number" min="0" step="0.01" value={salary} onChange={e=>setSalary(e.target.value)}/></label><label>Savings allocation (%)<input required type="number" min="0" max="100" step="1" value={allocation} onChange={e=>setAllocation(e.target.value)}/></label><button className="primary-button" disabled={saving}>Save plan</button></form></section>
  </div>;
}

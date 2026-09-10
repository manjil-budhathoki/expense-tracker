import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatNPR } from '../../utils/currency';
import { Trash2, Pencil, Search } from 'lucide-react';
export default function ExpenseList({ onEdit }) {
  const { expenses, categories, removeExpense } = useFinance();
  const [search,setSearch] = useState('');
  const [type,setType] = useState('');
  const [busy,setBusy] = useState(null);
  const [confirm,setConfirm] = useState(null);
  const rows = [...expenses].filter(e=>(!type || e.type===type) && `${e.note} ${categories.find(c=>c.id===e.category_id)?.name || ''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  return <section className="panel"><div className="section-heading"><h2>Transaction history</h2><span>{rows.length} records</span></div>
    <div className="transaction-filters"><label className="search-field"><Search size={17}/><input aria-label="Search transactions" placeholder="Search description or category" value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Filter transaction type" value={type} onChange={e=>setType(e.target.value)}><option value="">All transactions</option><option value="expense">Expenses</option><option value="saving">Savings</option></select></div>
    {rows.length ? rows.map(e=><div className="transaction-row flex-wrap" key={e.id}><div className="transaction-description"><strong>{e.note || 'Transaction'}</strong><small>{categories.find(c=>c.id===e.category_id)?.name || 'Other'} · {e.date}<br/>{e.payment_method} · {e.type}</small></div><strong className={e.type==='saving'?'text-emerald-700':''}>{formatNPR(e.amount)}</strong><div className="flex gap-1"><button className="icon-button" aria-label={`Edit ${e.note || 'transaction'}`} onClick={()=>onEdit(e)}><Pencil size={16}/></button><button className="icon-button danger" aria-label={`Delete ${e.note || 'transaction'}`} disabled={busy===e.id} onClick={()=>setConfirm(e.id)}><Trash2 size={16}/></button></div>{confirm===e.id && <div className="delete-confirm">Delete this transaction?<button disabled={busy===e.id} onClick={async()=>{setBusy(e.id);if(await removeExpense(e.id))setConfirm(null);setBusy(null);}}>Delete</button><button onClick={()=>setConfirm(null)}>Keep</button></div>}</div>) : <div className="empty-state">{expenses.length?'No transactions match your search.':'No transactions yet. Add your first one to get started.'}</div>}
  </section>;
}

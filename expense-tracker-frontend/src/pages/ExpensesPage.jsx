import { useState } from 'react';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
export default function ExpensesPage() {
  const [editing,setEditing] = useState(null);
  return <div className="space-y-7"><div className="page-heading"><div><p className="eyebrow">THE EVERYDAY DETAILS</p><h1>Your transactions.</h1><p>Track spending and savings, all in one place.</p></div></div><div className="expenses-grid"><div id="transaction-form"><ExpenseForm key={editing?.id || 'new'} expense={editing} onDone={()=>setEditing(null)}/></div><ExpenseList onEdit={e=>{setEditing(e);document.getElementById('transaction-form')?.scrollIntoView({behavior:'smooth',block:'start'});}}/></div></div>;
}

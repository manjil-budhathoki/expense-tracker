import { useState } from 'react';
import { useFinance, localDate } from '../../context/FinanceContext';

export default function ExpenseForm({ expense, onDone }) {
  const { addExpense, editExpense, categories, addCategory } = useFinance();
  const [form, setForm] = useState(expense || { note: '', amount: '', category_id: categories[0]?.id || '', type: 'expense', payment_method: 'Cash', date: localDate() });
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');
  const field = key => ({ value: form[key], onChange: e => setForm(s=>({...s,[key]:e.target.value})) });
  async function submit(e) {
    e.preventDefault(); setSubmitting(true); setMessage('');
    const data = { ...form, amount: Number(form.amount), category_id: Number(form.category_id) }; delete data.id;
    const ok = expense ? await editExpense(expense.id,data) : await addExpense(data);
    if(ok) { setForm(s=>({...s,note:'',amount:''})); setMessage('Transaction saved.'); onDone?.(); }
    setSubmitting(false);
  }
  return <section className="panel"><h2>{expense ? 'Edit transaction' : 'New transaction'}</h2><p className="text-sm text-zinc-500 mt-1 mb-6">Give every rupee a place.</p>
    <form onSubmit={submit} className="form-stack">
      <label>Description<input required maxLength="500" placeholder="e.g. Weekly groceries" {...field('note')}/></label>
      <div className="form-two"><label>Amount (NPR)<input required type="number" min="0.01" step="0.01" placeholder="0.00" {...field('amount')}/></label><label>Type<select {...field('type')}><option value="expense">Expense</option><option value="saving">Saving</option></select></label></div>
      <label>Category<select required {...field('category_id')}><option value="" disabled>Select category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Date<input required type="date" {...field('date')}/></label>
      <label>Payment method<select {...field('payment_method')}>{['Cash','Nabil bank','NIMB Bank','Card','E-sewa'].map(m=><option key={m}>{m}</option>)}</select></label>
      <button className="primary-button" disabled={submitting || !categories.length}>{submitting?'Saving…':expense?'Save changes':'Save transaction'}</button>
      {expense && <button type="button" className="secondary-button" onClick={onDone}>Cancel editing</button>}
      <p role="status" className="text-sm text-emerald-700">{message}</p>
    </form>
    {!expense && <details className="mt-5"><summary className="text-sm cursor-pointer text-zinc-600">Add a category</summary><form className="form-stack mt-3" onSubmit={async e=>{e.preventDefault();setSubmitting(true);if(await addCategory(newCategory.trim()))setNewCategory('');setSubmitting(false);}}><label>Category name<input required maxLength="100" value={newCategory} onChange={e=>setNewCategory(e.target.value)}/></label><button className="secondary-button" disabled={submitting}>Create category</button></form></details>}
  </section>;
}

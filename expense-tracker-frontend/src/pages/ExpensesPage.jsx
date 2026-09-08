import React from 'react';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';

export default function ExpensesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1">
        <ExpenseForm />
      </div>
      <div className="md:col-span-2">
        <ExpenseList />
      </div>
    </div>
  );
}
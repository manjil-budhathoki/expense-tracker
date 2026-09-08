import { get, post, put, del } from './api';

export async function fetchCategories() {
  return get('/v1/categories/');
}

export async function fetchExpenses({ skip = 0, limit = 100, category_id, type, payment_method, start_date, end_date } = {}) {
  const params = new URLSearchParams();
  params.set('skip', String(skip));
  params.set('limit', String(limit));
  if (category_id !== undefined) params.set('category_id', String(category_id));
  if (type) params.set('type', type);
  if (payment_method) params.set('payment_method', payment_method);
  if (start_date) params.set('start_date', start_date);
  if (end_date) params.set('end_date', end_date);
  return get(`/v1/expenses/?${params.toString()}`);
}

export async function createExpense(data) {
  return post('/v1/expenses/', data);
}

export async function updateExpense(id, data) {
  return put(`/v1/expenses/${id}`, data);
}

export async function deleteExpense(id) {
  return del(`/v1/expenses/${id}`);
}

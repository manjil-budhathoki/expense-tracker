import { useState } from 'react';
import { post } from '../utils/api';

export default function AuthScreen({ onSuccess }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', registration_code: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await post(register ? '/v1/auth/register' : '/v1/auth/login', form);
      onSuccess(result);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card">
    <h1>Paisa<span className="text-emerald-600">.</span></h1>
    <p>{register ? 'Create your invited account' : 'Sign in to your shared finances'}</p>
    <form onSubmit={submit}>
      {register && <label>Name<input name="name" value={form.name} onChange={update} required maxLength={100} autoComplete="name" /></label>}
      <label>Email<input type="email" name="email" value={form.email} onChange={update} required autoComplete="email" /></label>
      <label>Password<input type="password" name="password" value={form.password} onChange={update} required minLength={register ? 12 : undefined} autoComplete={register ? 'new-password' : 'current-password'} /></label>
      {register && <label>Registration code<input type="password" name="registration_code" value={form.registration_code} onChange={update} required autoComplete="off" /></label>}
      {error && <div className="error-banner" role="alert">{error}</div>}
      <button type="submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form>
    <button className="auth-switch" type="button" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already have an account? Sign in' : 'Have a registration code? Create an account'}</button>
  </section></main>;
}

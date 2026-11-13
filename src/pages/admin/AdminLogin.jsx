import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, Wand2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminLogin() {
  const { login, isAuthenticated, usingDefaultPassword, account } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from && location.state.from.startsWith("/admin") ? location.state.from : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setBusy(true);
    const res = await login(email, password, remember);
    setBusy(false);
    if (!res.success) { setError(res.message); return; }
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-icon"><ShieldCheck size={28} /></span>
        <h1>Admin sign in</h1>
        <p className="muted">Manage events, bookings and site settings.</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form className="form" onSubmit={submit} noValidate>
          <div className="field icon-field">
            <label htmlFor="a-email">Email</label>
            <Mail size={17} />
            <input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@eventify.com" />
          </div>
          <div className="field icon-field">
            <label htmlFor="a-pass">Password</label>
            <Lock size={17} />
            <input id="a-pass" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            <button type="button" className="eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          <div className="field check"><label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in for 7 days</label></div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Signing in…</> : "Sign in"}</button>
        </form>

        {usingDefaultPassword && (
          <div className="demo-box">
            <b>Demo credentials</b>
            <code>{account.email}</code> <code>Admin@123</code>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEmail(account.email); setPassword("Admin@123"); setError(""); }}><Wand2 size={14} /> Fill for me</button>
          </div>
        )}
        <Link to="/" className="link-arrow back-home">← Back to website</Link>
      </div>
    </div>
  );
}

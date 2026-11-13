import { useState } from "react";
import { Save, KeyRound, Eye, EyeOff, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useEvents } from "../../context/EventContext";
import { formatDateTime, initials } from "../../utils/format";

function strength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function AdminProfile() {
  const { account, updateAccount, changePassword, session, usingDefaultPassword } = useAdmin();
  const { notify } = useEvents();
  const [form, setForm] = useState({ name: account.name, email: account.email, phone: account.phone });
  const [msg, setMsg] = useState(null);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const saveProfile = (e) => {
    e.preventDefault();
    const r = updateAccount(form);
    setMsg(r);
    if (r.success) notify(r.message);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await changePassword(pw.current, pw.next, pw.confirm);
    setBusy(false);
    setPwMsg(r);
    if (r.success) { setPw({ current: "", next: "", confirm: "" }); notify(r.message); }
  };

  const sc = strength(pw.next);
  const dirty = form.name !== account.name || form.email !== account.email || form.phone !== account.phone;

  return (
    <>
      <div className="admin-head"><div><h1>My profile</h1><p className="muted">Manage your administrator account and security.</p></div></div>

      <div className="admin-grid-2 profile-grid">
        <section className="panel profile-card plain">
          <div className="avatar avatar-lg">{initials(account.name)}</div>
          <h2>{account.name}</h2>
          <span className="status-pill green"><ShieldCheck size={13} /> {account.role}</span>
          <ul className="meta-list left">
            <li><Clock size={15} /> Signed in {session ? formatDateTime(session.loginTime) : "—"}</li>
            <li><Clock size={15} /> Session expires {session ? formatDateTime(new Date(session.expiresAt).toISOString()) : "—"}</li>
          </ul>
          {usingDefaultPassword && <div className="alert alert-warn">Default password in use — please change it below.</div>}
        </section>

        <form className="panel form" onSubmit={saveProfile} noValidate>
          <h2>Account details</h2>
          {msg && <div className={`alert ${msg.success ? "alert-ok" : "alert-error"}`} role="alert">{msg.message}</div>}
          <div className="field"><label htmlFor="ap-name">Full name</label><input id="ap-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field-row">
            <div className="field"><label htmlFor="ap-email">Login email</label><input id="ap-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label htmlFor="ap-phone">Phone</label><input id="ap-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" /></div>
          </div>
          <button className="btn btn-primary" disabled={!dirty}><Save size={16} /> Save profile</button>
        </form>
      </div>

      <form className="panel form" onSubmit={savePassword} noValidate>
        <h2><KeyRound size={18} className="inline-icon" /> Change password</h2>
        {pwMsg && <div className={`alert ${pwMsg.success ? "alert-ok" : "alert-error"}`} role="alert">{pwMsg.message}</div>}
        <div className="field-row three">
          <div className="field"><label htmlFor="pw-cur">Current password</label><input id="pw-cur" type={show ? "text" : "password"} autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
          <div className="field"><label htmlFor="pw-new">New password</label><input id="pw-new" type={show ? "text" : "password"} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            {pw.next && <div className={`meter s${sc}`} aria-label={`Password strength ${sc} of 4`}><i /><i /><i /><i /></div>}
          </div>
          <div className="field"><label htmlFor="pw-con">Confirm new password</label><input id="pw-con" type={show ? "text" : "password"} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy || !pw.current || !pw.next || !pw.confirm}>{busy ? <><Loader2 size={16} className="spin" /> Updating…</> : "Update password"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />} {show ? "Hide" : "Show"} passwords</button>
        </div>
        <p className="muted small">Use 8+ characters with letters and numbers. Passwords are hashed (SHA-256) before being stored in this browser.</p>
      </form>
    </>
  );
}

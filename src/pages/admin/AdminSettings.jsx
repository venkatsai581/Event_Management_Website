import { useState } from "react";
import { Save, RotateCcw, Trash2, DatabaseZap } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useEvents, DEFAULT_SETTINGS } from "../../context/EventContext";
import { useAdmin } from "../../context/AdminContext";
import { EMAIL_RE } from "../../utils/format";

export default function AdminSettings() {
  const { settings, updateSettings, resetSettings, resetDemoData, clearBookings, bookings, notify } = useEvents();
  const { resetAccount } = useAdmin();
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  const save = (e) => {
    e.preventDefault();
    const v = {};
    if (form.siteName.trim().length < 2) v.siteName = "Site name is required.";
    if (!EMAIL_RE.test(form.contactEmail.trim())) v.contactEmail = "Enter a valid contact email.";
    const mt = Number(form.maxTickets);
    if (!Number.isInteger(mt) || mt < 1 || mt > 50) v.maxTickets = "Enter a whole number from 1 to 50.";
    if (!form.currency.trim() || form.currency.length > 4) v.currency = "Use 1–4 characters, e.g. ₹ or USD.";
    setErrors(v);
    if (Object.keys(v).length) return;
    updateSettings({ ...form, siteName: form.siteName.trim(), tagline: form.tagline.trim(), contactEmail: form.contactEmail.trim(), currency: form.currency.trim(), maxTickets: mt, sessionHours: Number(form.sessionHours) });
    notify("Settings saved");
  };

  const actions = {
    reset: { title: "Reset settings?", text: "Restore all settings to their defaults.", btn: "Reset settings", run: () => { resetSettings(); setForm(DEFAULT_SETTINGS); notify("Settings reset", "info"); } },
    bookings: { title: "Clear all bookings?", text: `This permanently deletes all ${bookings.length} booking record(s).`, btn: "Clear bookings", run: () => { clearBookings(); notify("All bookings cleared", "info"); } },
    demo: { title: "Reset demo data?", text: "Restores the sample events and removes all bookings and saved events. Your admin account is kept.", btn: "Reset data", run: () => { resetDemoData(); notify("Demo data restored", "info"); } },
    account: { title: "Reset admin account?", text: "Restores the default admin email and password (admin@eventify.com / Admin@123).", btn: "Reset account", run: () => { resetAccount(); notify("Admin account reset to defaults", "info"); } },
  };
  const a = confirm && actions[confirm];

  return (
    <>
      <div className="admin-head"><div><h1>Settings</h1><p className="muted">Configure the website, bookings and security.</p></div></div>

      <form className="panel form" onSubmit={save} noValidate>
        <h2>Website</h2>
        <div className="field-row">
          <div className={`field ${errors.siteName ? "invalid" : ""}`}><label htmlFor="s-name">Site name</label><input id="s-name" value={form.siteName} onChange={set("siteName")} />{errors.siteName && <span className="err">{errors.siteName}</span>}</div>
          <div className={`field ${errors.contactEmail ? "invalid" : ""}`}><label htmlFor="s-mail">Contact email</label><input id="s-mail" type="email" value={form.contactEmail} onChange={set("contactEmail")} />{errors.contactEmail && <span className="err">{errors.contactEmail}</span>}</div>
        </div>
        <div className="field"><label htmlFor="s-tag">Tagline</label><input id="s-tag" value={form.tagline} onChange={set("tagline")} /></div>

        <h2 className="mt">Bookings</h2>
        <div className="field-row three">
          <div className={`field ${errors.currency ? "invalid" : ""}`}><label htmlFor="s-cur">Currency symbol</label><input id="s-cur" value={form.currency} onChange={set("currency")} />{errors.currency && <span className="err">{errors.currency}</span>}</div>
          <div className={`field ${errors.maxTickets ? "invalid" : ""}`}><label htmlFor="s-max">Max tickets per booking</label><input id="s-max" type="number" min="1" max="50" value={form.maxTickets} onChange={set("maxTickets")} />{errors.maxTickets && <span className="err">{errors.maxTickets}</span>}</div>
          <div className="field"><label htmlFor="s-sess">Admin session length</label>
            <select id="s-sess" value={form.sessionHours} onChange={set("sessionHours")}>{[1, 4, 8, 24].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}</select></div>
        </div>
        <div className="field check switch-row"><label><input type="checkbox" checked={form.registrationsOpen} onChange={set("registrationsOpen")} /> Accept new registrations <small className="muted">(turn off to pause all bookings)</small></label></div>

        <div className="btn-row">
          <button className="btn btn-primary" disabled={!dirty}><Save size={16} /> Save settings</button>
          <button type="button" className="btn btn-ghost" disabled={!dirty} onClick={() => { setForm(settings); setErrors({}); }}>Discard</button>
        </div>
      </form>

      <section className="panel danger-zone">
        <h2>Data & security</h2>
        <p className="muted">All data lives in this browser's localStorage. These actions can't be undone.</p>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setConfirm("reset")}><RotateCcw size={16} /> Reset settings</button>
          <button className="btn btn-ghost" onClick={() => setConfirm("demo")}><DatabaseZap size={16} /> Reset demo data</button>
          <button className="btn btn-ghost btn-danger-text" onClick={() => setConfirm("bookings")} disabled={!bookings.length}><Trash2 size={16} /> Clear bookings</button>
          <button className="btn btn-ghost btn-danger-text" onClick={() => setConfirm("account")}>Reset admin account</button>
        </div>
      </section>

      <ConfirmDialog open={Boolean(a)} danger title={a?.title} message={a?.text} confirmText={a?.btn} onConfirm={() => { a.run(); setConfirm(null); }} onCancel={() => setConfirm(null)} />
    </>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Save, RotateCcw, Ticket, Heart, CalendarCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useEvents } from "../context/EventContext";
import { CATEGORIES, CATEGORY_META } from "../data/events";
import { EMAIL_RE, PHONE_RE, initials } from "../utils/format";

export default function Profile() {
  const { profile, updateProfile, stats, saved, notify } = useEvents();
  const [form, setForm] = useState({ ...profile, interests: profile.interests || [] });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleInterest = (c) => setForm((f) => ({ ...f, interests: f.interests.includes(c) ? f.interests.filter((x) => x !== c) : [...f.interests, c] }));
  const dirty = JSON.stringify(form) !== JSON.stringify({ ...profile, interests: profile.interests || [] });

  const submit = (e) => {
    e.preventDefault();
    const v = {};
    if (form.name.trim().length < 2) v.name = "Enter your name (min 2 characters).";
    if (form.email && !EMAIL_RE.test(form.email.trim())) v.email = "Enter a valid email address.";
    if (form.phone && !PHONE_RE.test(form.phone.trim())) v.phone = "Enter a valid phone number.";
    setErrors(v);
    if (Object.keys(v).length) return;
    updateProfile({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), city: form.city.trim(), bio: form.bio.trim() });
    notify("Profile saved. It will pre-fill your registrations.");
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" subtitle="Save your details once and register faster." />
      <div className="container section-sm profile-layout">
        <aside className="panel profile-card">
          <div className="avatar avatar-lg">{initials(profile.name)}</div>
          <h2>{profile.name || "Guest user"}</h2>
          <p className="muted">{profile.email || "Add your email to speed up checkout"}</p>
          <div className="mini-stats stacked">
            <div><CalendarCheck size={18} /><b>{stats.bookings}</b><span>Bookings</span></div>
            <div><Ticket size={18} /><b>{stats.tickets}</b><span>Tickets</span></div>
            <div><Heart size={18} /><b>{saved.length}</b><span>Saved</span></div>
          </div>
          <Link to="/my-events" className="btn btn-ghost btn-block">View my events</Link>
        </aside>

        <form className="panel form" onSubmit={submit} noValidate>
          <h2>Personal details</h2>
          <div className="field-row">
            <div className={`field ${errors.name ? "invalid" : ""}`}>
              <label htmlFor="p-name">Full name</label>
              <input id="p-name" value={form.name} onChange={set("name")} autoComplete="name" />
              {errors.name && <span className="err">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="p-city">City</label>
              <input id="p-city" value={form.city} onChange={set("city")} placeholder="Hyderabad" />
            </div>
          </div>
          <div className="field-row">
            <div className={`field ${errors.email ? "invalid" : ""}`}>
              <label htmlFor="p-email">Email</label>
              <input id="p-email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
              {errors.email && <span className="err">{errors.email}</span>}
            </div>
            <div className={`field ${errors.phone ? "invalid" : ""}`}>
              <label htmlFor="p-phone">Phone</label>
              <input id="p-phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              {errors.phone && <span className="err">{errors.phone}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="p-bio">About you</label>
            <textarea id="p-bio" rows={3} value={form.bio} onChange={set("bio")} maxLength={240} placeholder="A short line about what you love." />
          </div>
          <div className="field">
            <label>Interests</label>
            <div className="chips wrap">
              {CATEGORIES.map((c) => (
                <button type="button" key={c} className={`chip ${form.interests.includes(c) ? "active" : ""}`} aria-pressed={form.interests.includes(c)} onClick={() => toggleInterest(c)}>
                  {CATEGORY_META[c].emoji} {c}
                </button>
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={!dirty}><Save size={16} /> Save changes</button>
            <button className="btn btn-ghost" type="button" disabled={!dirty} onClick={() => { setForm({ ...profile, interests: profile.interests || [] }); setErrors({}); }}><RotateCcw size={16} /> Discard</button>
          </div>
          <p className="muted small">Your profile is stored only in this browser.</p>
        </form>
      </div>
    </>
  );
}

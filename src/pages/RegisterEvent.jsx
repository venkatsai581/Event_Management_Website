import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, CheckCircle2, CalendarDays, MapPin, SearchX, Lock } from "lucide-react";
import Banner from "../components/Banner";
import EmptyState from "../components/EmptyState";
import { useEvents } from "../context/EventContext";
import { EMAIL_RE, PHONE_RE, formatDateLong, formatTime, isPast, money } from "../utils/format";

export default function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, getAvailableTickets, registerForEvent, profile, settings, notify } = useEvents();
  const event = getEventById(id);

  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone, note: "" });
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agree, setAgree] = useState(false);
  const [serverError, setServerError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => { document.title = event ? `Register · ${event.title}` : "Eventify"; }, [event]);

  if (!event) {
    return (
      <div className="container section">
        <EmptyState icon={SearchX} title="Event not found" text="We couldn't find the event you want to register for.">
          <Link to="/events" className="btn btn-primary">Browse events</Link>
        </EmptyState>
      </div>
    );
  }

  const left = getAvailableTickets(event.id);
  const max = Math.max(1, Math.min(settings.maxTickets, left));
  const closed = isPast(event) || left === 0 || !settings.registrationsOpen;
  const q = Math.min(qty, max);
  const total = Number(event.price) * q;

  const validate = (f = form) => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Enter your full name (min 2 characters).";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email, e.g. name@example.com.";
    if (!PHONE_RE.test(f.phone.trim())) e.phone = "Enter a valid phone number (7–18 digits).";
    if (!agree) e.agree = "Please accept the terms to continue.";
    return e;
  };

  const change = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  };
  const blur = (field) => () => { setTouched((t) => ({ ...t, [field]: true })); setErrors(validate()); };

  const submit = (e) => {
    e.preventDefault();
    setServerError("");
    const v = validate();
    setErrors(v);
    setTouched({ name: true, email: true, phone: true, agree: true });
    if (Object.keys(v).length) return;
    const result = registerForEvent(event.id, form, q);
    if (!result.success) { setServerError(result.message); return; }
    notify(result.message);
    setBooking(result.booking);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (booking) {
    return (
      <div className="container section narrow">
        <div className="panel success-panel">
          <span className="success-icon"><CheckCircle2 size={44} /></span>
          <h1>You're registered!</h1>
          <p className="muted">A confirmation for <b>{booking.attendee.email}</b> is saved in My Events.</p>
          <div className="receipt">
            <div><span>Booking ID</span><b className="mono">{booking.bookingId}</b></div>
            <div><span>Event</span><b>{event.title}</b></div>
            <div><span>Date</span><b>{formatDateLong(event.date)} · {formatTime(event.time)}</b></div>
            <div><span>Venue</span><b>{event.venue}, {event.city}</b></div>
            <div><span>Tickets</span><b>{booking.ticketQuantity}</b></div>
            <div><span>Total paid</span><b>{money(booking.totalPrice, settings.currency)}</b></div>
          </div>
          <div className="btn-row center">
            <Link to="/my-events" className="btn btn-primary">Go to My Events</Link>
            <Link to="/events" className="btn btn-ghost">Browse more</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <button className="btn btn-ghost btn-sm back" onClick={() => navigate(`/events/${event.id}`)}><ArrowLeft size={16} /> Back to event</button>
      <h1 className="h-page">Register for event</h1>

      <div className="register-layout">
        <form className="panel form" onSubmit={submit} noValidate>
          <h2>Attendee details</h2>
          {closed && <div className="alert alert-error">{isPast(event) ? "Registration for this event has closed." : left === 0 ? "This event is sold out." : "Registrations are currently paused by the organizer."}</div>}
          {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

          <div className={`field ${errors.name && touched.name ? "invalid" : ""}`}>
            <label htmlFor="name">Full name</label>
            <input id="name" autoComplete="name" value={form.name} onChange={change("name")} onBlur={blur("name")} placeholder="e.g. Aarav Sharma" disabled={closed} />
            {errors.name && touched.name && <span className="err">{errors.name}</span>}
          </div>
          <div className="field-row">
            <div className={`field ${errors.email && touched.email ? "invalid" : ""}`}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={change("email")} onBlur={blur("email")} placeholder="you@example.com" disabled={closed} />
              {errors.email && touched.email && <span className="err">{errors.email}</span>}
            </div>
            <div className={`field ${errors.phone && touched.phone ? "invalid" : ""}`}>
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={change("phone")} onBlur={blur("phone")} placeholder="+91 98765 43210" disabled={closed} />
              {errors.phone && touched.phone && <span className="err">{errors.phone}</span>}
            </div>
          </div>

          <div className="field">
            <label>Number of tickets <small className="muted">(max {max})</small></label>
            <div className="stepper">
              <button type="button" className="icon-btn" aria-label="Decrease tickets" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={closed || q <= 1}><Minus size={16} /></button>
              <output aria-live="polite">{q}</output>
              <button type="button" className="icon-btn" aria-label="Increase tickets" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={closed || q >= max}><Plus size={16} /></button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="note">Special requests <small className="muted">(optional)</small></label>
            <textarea id="note" rows={3} value={form.note} onChange={change("note")} placeholder="Accessibility needs, dietary requirements…" disabled={closed} maxLength={300} />
          </div>

          <div className={`field check ${errors.agree && touched.agree ? "invalid" : ""}`}>
            <label><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); if (touched.agree) setErrors((x) => ({ ...x, agree: e.target.checked ? undefined : x.agree })); }} disabled={closed} /> I agree to the event terms and the cancellation policy.</label>
            {errors.agree && touched.agree && <span className="err">{errors.agree}</span>}
          </div>

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={closed}>
            <Lock size={16} /> Confirm registration · {money(total, settings.currency)}
          </button>
          <p className="muted small center-text">Demo checkout — no real payment is taken.</p>
        </form>

        <aside className="panel summary">
          <div className="summary-media"><Banner event={event} /></div>
          <h3>{event.title}</h3>
          <ul className="meta-list">
            <li><CalendarDays size={15} /> {formatDateLong(event.date)} · {formatTime(event.time)}</li>
            <li><MapPin size={15} /> {event.venue}, {event.city}</li>
          </ul>
          <div className="sum-rows">
            <div><span>Price × {q}</span><b>{money(event.price, settings.currency)} × {q}</b></div>
            <div className="sum-total"><span>Total</span><b>{money(total, settings.currency)}</b></div>
          </div>
          <p className="muted small">{left} tickets remaining</p>
        </aside>
      </div>
    </div>
  );
}

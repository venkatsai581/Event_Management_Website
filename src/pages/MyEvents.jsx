import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Ticket, Wallet, CalendarDays, MapPin, X, Printer, QrCode, Heart } from "lucide-react";
import Banner from "../components/Banner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import { useEvents } from "../context/EventContext";
import { countdownLabel, formatDate, formatDateTime, formatTime, isPast, money, parseDate } from "../utils/format";

// Deterministic pseudo-QR so each ticket looks unique (decorative, not scannable).
function TicketCode({ value }) {
  const cells = useMemo(() => {
    let seed = [...value].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return Array.from({ length: 169 }, () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % 100 < 48; });
  }, [value]);
  return (
    <div className="qr" aria-hidden="true">
      {cells.map((on, i) => <span key={i} className={on ? "on" : ""} />)}
    </div>
  );
}

export default function MyEvents() {
  const { bookings, getEventById, cancelBooking, deleteBooking, notify, stats, settings, events, saved } = useEvents();
  const [tab, setTab] = useState("upcoming");
  const [ticket, setTicket] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [toRemove, setToRemove] = useState(null);

  const rows = useMemo(() => bookings.map((b) => ({ b, e: getEventById(b.eventId) })).filter((r) => r.e), [bookings, getEventById]);
  const upcoming = rows.filter(({ b, e }) => b.status !== "Cancelled" && !isPast(e)).sort((x, y) => parseDate(x.e.date, x.e.time) - parseDate(y.e.date, y.e.time));
  const past = rows.filter(({ b, e }) => b.status !== "Cancelled" && isPast(e));
  const cancelled = rows.filter(({ b }) => b.status === "Cancelled");
  const savedEvents = events.filter((e) => saved.includes(e.id));

  const lists = { upcoming, past, cancelled };
  const tabs = [
    ["upcoming", "Upcoming", upcoming.length],
    ["past", "Attended", past.length],
    ["cancelled", "Cancelled", cancelled.length],
    ["saved", "Saved", savedEvents.length],
  ];

  const confirmCancel = () => {
    const r = cancelBooking(toCancel.b.bookingId);
    notify(r.message, r.success ? "success" : "error");
    setToCancel(null);
  };

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="My Events" subtitle="Everything you've registered for, in one place." />
      <div className="container section-sm">
        <div className="mini-stats">
          <div><CalendarCheck size={20} /><b>{stats.bookings}</b><span>Active bookings</span></div>
          <div><Ticket size={20} /><b>{stats.tickets}</b><span>Tickets</span></div>
          <div><Wallet size={20} /><b>{money(stats.revenue, settings.currency)}</b><span>Total spent</span></div>
          <div><Heart size={20} /><b>{savedEvents.length}</b><span>Saved</span></div>
        </div>

        <div className="tabs" role="tablist">
          {tabs.map(([key, label, n]) => (
            <button key={key} role="tab" aria-selected={tab === key} className={`tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
              {label} <span className="count-pill">{n}</span>
            </button>
          ))}
        </div>

        {tab === "saved" ? (
          savedEvents.length ? (
            <div className="grid-3">{savedEvents.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <EmptyState icon={Heart} title="No saved events" text="Tap the heart on any event to keep it here.">
              <Link to="/events" className="btn btn-primary">Browse events</Link>
            </EmptyState>
          )
        ) : lists[tab].length === 0 ? (
          <EmptyState icon={Ticket} title={tab === "upcoming" ? "No upcoming registrations" : tab === "past" ? "No attended events yet" : "No cancelled bookings"}
            text={tab === "upcoming" ? "Register for an event and it will show up here." : undefined}>
            {tab === "upcoming" && <Link to="/events" className="btn btn-primary">Find events</Link>}
          </EmptyState>
        ) : (
          <div className="booking-list">
            {lists[tab].map(({ b, e }) => (
              <article className="booking-item" key={b.bookingId}>
                <Link to={`/events/${e.id}`} className="bi-media"><Banner event={e} /></Link>
                <div className="bi-body">
                  <div className="bi-top">
                    <h3><Link to={`/events/${e.id}`}>{e.title}</Link></h3>
                    <span className={`status-pill ${b.status === "Cancelled" ? "red" : isPast(e) ? "gray" : "green"}`}>
                      {b.status === "Cancelled" ? "Cancelled" : isPast(e) ? "Completed" : countdownLabel(e.date)}
                    </span>
                  </div>
                  <ul className="meta-list">
                    <li><CalendarDays size={15} /> {formatDate(e.date)} · {formatTime(e.time)}</li>
                    <li><MapPin size={15} /> {e.venue}, {e.city}</li>
                    <li><Ticket size={15} /> {b.ticketQuantity} ticket{b.ticketQuantity > 1 ? "s" : ""} · {money(b.totalPrice, settings.currency)}</li>
                  </ul>
                  <p className="muted small">ID <span className="mono">{b.bookingId}</span> · Booked {formatDateTime(b.bookingDate)}</p>
                  <div className="btn-row">
                    {b.status !== "Cancelled" && <button className="btn btn-primary btn-sm" onClick={() => setTicket({ b, e })}><QrCode size={15} /> View ticket</button>}
                    {tab === "upcoming" && <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => setToCancel({ b, e })}>Cancel booking</button>}
                    {tab === "cancelled" && <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => setToRemove({ b, e })}>Remove</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {ticket && (
        <div className="modal-overlay" onClick={() => setTicket(null)}>
          <div className="modal ticket" role="dialog" aria-modal="true" aria-label="Event ticket" onClick={(ev) => ev.stopPropagation()}>
            <button className="icon-btn modal-x" aria-label="Close ticket" onClick={() => setTicket(null)}><X size={18} /></button>
            <div className="ticket-top"><Banner event={ticket.e} /><div className="ticket-shade" /><h3>{ticket.e.title}</h3></div>
            <div className="ticket-body">
              <div className="ticket-grid">
                <div><small>Attendee</small><b>{ticket.b.attendee.name}</b></div>
                <div><small>Tickets</small><b>{ticket.b.ticketQuantity}</b></div>
                <div><small>Date</small><b>{formatDate(ticket.e.date)}</b></div>
                <div><small>Time</small><b>{formatTime(ticket.e.time)}</b></div>
                <div className="span2"><small>Venue</small><b>{ticket.e.venue}, {ticket.e.city}</b></div>
              </div>
              <div className="ticket-cut" />
              <div className="ticket-code"><TicketCode value={ticket.b.bookingId} /><span className="mono">{ticket.b.bookingId}</span></div>
              <button className="btn btn-ghost btn-block no-print" onClick={() => window.print()}><Printer size={16} /> Print ticket</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={Boolean(toCancel)} danger title="Cancel this booking?" confirmText="Yes, cancel"
        message={toCancel ? `Your ${toCancel.b.ticketQuantity} ticket(s) for “${toCancel.e.title}” will be released.` : ""}
        onConfirm={confirmCancel} onCancel={() => setToCancel(null)} />
      <ConfirmDialog open={Boolean(toRemove)} danger title="Remove from history?" confirmText="Remove"
        message="This permanently removes the cancelled booking record."
        onConfirm={() => { deleteBooking(toRemove.b.bookingId); setToRemove(null); notify("Booking record removed", "info"); }} onCancel={() => setToRemove(null)} />
    </>
  );
}

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, Ticket, Wallet, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { useEvents } from "../../context/EventContext";
import { CATEGORY_META } from "../../data/events";
import { formatDateTime, isPast, money } from "../../utils/format";

export default function AdminDashboard() {
  const { events, activeBookings, bookings, stats, getAvailableTickets, getEventById, settings } = useEvents();

  const upcoming = events.filter((e) => !isPast(e)).length;
  const byCategory = useMemo(() => {
    const m = {};
    activeBookings.forEach((b) => {
      const e = getEventById(b.eventId);
      if (e) m[e.category] = (m[e.category] || 0) + Number(b.ticketQuantity);
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [activeBookings, getEventById]);
  const maxCat = Math.max(1, ...byCategory.map(([, n]) => n));

  const topEvents = useMemo(() => events.map((e) => ({ e, sold: Number(e.capacity) - getAvailableTickets(e.id) }))
    .filter((x) => x.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 5), [events, getAvailableTickets]);

  const recent = bookings.slice(0, 6);

  const cards = [
    { icon: CalendarRange, label: "Total events", value: events.length, sub: `${upcoming} upcoming`, tone: "violet" },
    { icon: Ticket, label: "Active bookings", value: stats.bookings, sub: `${bookings.length - stats.bookings} cancelled`, tone: "coral" },
    { icon: TrendingUp, label: "Tickets sold", value: stats.tickets, sub: "across all events", tone: "teal" },
    { icon: Wallet, label: "Revenue", value: money(stats.revenue, settings.currency), sub: "confirmed bookings", tone: "amber" },
  ];

  return (
    <>
      <div className="admin-head">
        <div><h1>Dashboard</h1><p className="muted">Overview of events and bookings.</p></div>
        <Link to="/admin/events?new=1" className="btn btn-primary"><Plus size={16} /> New event</Link>
      </div>

      <div className="stat-cards">
        {cards.map(({ icon: Icon, label, value, sub, tone }) => (
          <div className={`stat-card tone-${tone}`} key={label}>
            <span className="stat-icon"><Icon size={20} /></span>
            <small>{label}</small><b>{value}</b><em>{sub}</em>
          </div>
        ))}
      </div>

      <div className="admin-grid-2">
        <section className="panel">
          <h2>Tickets by category</h2>
          {byCategory.length === 0 ? <p className="muted">No bookings yet. Register for an event to see data here.</p> : (
            <ul className="bars">
              {byCategory.map(([cat, n]) => (
                <li key={cat}>
                  <span>{CATEGORY_META[cat]?.emoji} {cat}</span>
                  <div className="bar"><i style={{ width: `${(n / maxCat) * 100}%` }} /></div>
                  <b>{n}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Top events</h2>
          {topEvents.length === 0 ? <p className="muted">Nothing sold yet.</p> : (
            <ol className="rank">
              {topEvents.map(({ e, sold }) => (
                <li key={e.id}><span>{e.title}</span><b>{sold}/{e.capacity}</b></li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><h2>Recent bookings</h2><Link to="/admin/bookings" className="link-arrow">View all <ArrowRight size={15} /></Link></div>
        {recent.length === 0 ? <p className="muted">No bookings yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Booking</th><th>Attendee</th><th>Event</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.bookingId}>
                    <td className="mono">{b.bookingId}</td><td>{b.attendee.name}</td><td>{getEventById(b.eventId)?.title || "Deleted event"}</td>
                    <td>{b.ticketQuantity}</td><td>{money(b.totalPrice, settings.currency)}</td>
                    <td><span className={`status-pill ${b.status === "Cancelled" ? "red" : "green"}`}>{b.status}</span></td>
                    <td>{formatDateTime(b.bookingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Heart, Share2, Ticket, User, Timer, ExternalLink, SearchX } from "lucide-react";
import Banner from "../components/Banner";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { useEvents } from "../context/EventContext";
import { countdownLabel, formatDateLong, formatTime, isPast, money } from "../utils/format";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, events, getAvailableTickets, isSaved, toggleSaved, notify, settings, activeBookings } = useEvents();
  const event = getEventById(id);

  const related = useMemo(
    () => events.filter((e) => event && e.id !== event.id && e.category === event.category && !isPast(e)).slice(0, 3),
    [events, event]
  );

  if (!event) {
    return (
      <div className="container section">
        <EmptyState icon={SearchX} title="Event not found" text="This event may have been removed or the link is incorrect.">
          <Link to="/events" className="btn btn-primary">Browse events</Link>
        </EmptyState>
      </div>
    );
  }

  const left = getAvailableTickets(event.id);
  const sold = Number(event.capacity) - left;
  const pct = Math.min(100, Math.round((sold / Math.max(1, Number(event.capacity))) * 100));
  const past = isPast(event);
  const soldOut = left === 0;
  const saved = isSaved(event.id);
  const mine = activeBookings.filter((b) => b.eventId === event.id);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.city}`)}`;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: event.title, url }); return; }
      await navigator.clipboard.writeText(url);
      notify("Event link copied to clipboard", "info");
    } catch {
      notify("Could not share — copy the address bar link instead.", "error");
    }
  };

  return (
    <>
      <section className="detail-hero">
        <Banner event={event} eager className="detail-hero-img" />
        <div className="detail-hero-shade" />
        <div className="container detail-hero-content">
          <button className="btn btn-glass btn-sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/events"))}><ArrowLeft size={16} /> Back</button>
          <div>
            <span className="badge badge-cat">{event.category}</span>
            {event.featured && <span className="badge badge-gold">★ Featured</span>}
            <h1>{event.title}</h1>
            <p className="lead">{formatDateLong(event.date)} · {event.venue}, {event.city}</p>
          </div>
        </div>
      </section>

      <div className="container detail-layout">
        <div className="detail-main">
          <div className="info-grid">
            <div className="info-tile"><CalendarDays size={20} /><small>Date</small><b>{formatDateLong(event.date)}</b></div>
            <div className="info-tile"><Clock size={20} /><small>Time</small><b>{formatTime(event.time)}</b></div>
            <div className="info-tile"><Timer size={20} /><small>Duration</small><b>{event.duration || "—"}</b></div>
            <div className="info-tile"><User size={20} /><small>Organizer</small><b>{event.organizer || "—"}</b></div>
          </div>

          <section className="panel">
            <h2>About this event</h2>
            <p className="prose">{event.description}</p>
          </section>

          <section className="panel">
            <h2>Venue</h2>
            <p className="prose"><MapPin size={16} className="inline-icon" /> <b>{event.venue}</b>, {event.city}</p>
            <a className="btn btn-ghost btn-sm" href={mapUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open in Maps</a>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="h-section">More in {event.category}</h2>
              <div className="grid-3 grid-3-tight">{related.map((e) => <EventCard key={e.id} event={e} />)}</div>
            </section>
          )}
        </div>

        <aside className="detail-side">
          <div className="panel booking-card">
            <div className="booking-price"><span>{money(event.price, settings.currency)}</span>{Number(event.price) > 0 && <small>per ticket</small>}</div>
            <span className={`status-pill ${past ? "gray" : soldOut ? "red" : "green"}`}>{past ? "Event ended" : soldOut ? "Sold out" : countdownLabel(event.date)}</span>

            <div className="progress" aria-label={`${pct}% booked`}><span style={{ width: `${pct}%` }} /></div>
            <p className="muted small">{past ? `${sold} attended` : soldOut ? "All tickets booked" : `${left} of ${event.capacity} tickets left`}</p>

            {mine.length > 0 && <p className="note-ok">✓ You're registered ({mine.reduce((s, b) => s + b.ticketQuantity, 0)} ticket(s)). <Link to="/my-events">View</Link></p>}

            {past ? (
              <button className="btn btn-block" disabled>Registration closed</button>
            ) : soldOut ? (
              <button className="btn btn-block" disabled>Sold out</button>
            ) : !settings.registrationsOpen ? (
              <button className="btn btn-block" disabled>Registrations paused</button>
            ) : (
              <Link to={`/register/${event.id}`} className="btn btn-primary btn-lg btn-block"><Ticket size={18} /> Register now</Link>
            )}
            <div className="btn-row split">
              <button className={`btn btn-ghost ${saved ? "is-saved" : ""}`} onClick={() => { toggleSaved(event.id); notify(saved ? "Removed from saved" : "Saved for later", "info"); }} aria-pressed={saved}>
                <Heart size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
              </button>
              <button className="btn btn-ghost" onClick={share}><Share2 size={16} /> Share</button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

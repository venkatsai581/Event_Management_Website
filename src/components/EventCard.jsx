import { Link } from "react-router-dom";
import { Heart, MapPin, Clock, Ticket } from "lucide-react";
import Banner from "./Banner";
import { useEvents } from "../context/EventContext";
import { dayParts, formatTime, money, isPast } from "../utils/format";

export default function EventCard({ event }) {
  const { getAvailableTickets, isSaved, toggleSaved, notify, settings } = useEvents();
  const left = getAvailableTickets(event.id);
  const past = isPast(event);
  const soldOut = left === 0;
  const { day, month } = dayParts(event.date);
  const saved = isSaved(event.id);
  const low = !soldOut && left <= Math.max(10, Number(event.capacity) * 0.1);

  return (
    <article className="card event-card">
      <Link to={`/events/${event.id}`} className="card-media" aria-label={`View ${event.title}`}>
        <Banner event={event} />
        <span className="badge badge-cat">{event.category}</span>
        <span className="date-chip"><b>{day}</b><i>{month}</i></span>
        {(soldOut || past) && <span className="ribbon">{past ? "Ended" : "Sold out"}</span>}
      </Link>
      <button
        type="button"
        className={`icon-btn save-btn ${saved ? "active" : ""}`}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save event"}
        onClick={() => { toggleSaved(event.id); notify(saved ? "Removed from saved events" : "Saved for later", "info"); }}
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
      </button>

      <div className="card-body">
        <h3 className="card-title"><Link to={`/events/${event.id}`}>{event.title}</Link></h3>
        <ul className="meta-list">
          <li><Clock size={15} /> {formatTime(event.time)} · {event.duration}</li>
          <li><MapPin size={15} /> {event.venue}, {event.city}</li>
          <li className={low ? "warn" : ""}><Ticket size={15} /> {past ? "Event ended" : soldOut ? "No tickets left" : `${left} tickets left`}</li>
        </ul>
        <div className="card-foot">
          <span className="price">{money(event.price, settings.currency)}</span>
          <div className="btn-row">
            <Link to={`/events/${event.id}`} className="btn btn-ghost btn-sm">Details</Link>
            {past || soldOut ? (
              <button className="btn btn-sm" disabled>{past ? "Closed" : "Sold out"}</button>
            ) : (
              <Link to={`/register/${event.id}`} className="btn btn-primary btn-sm">Register</Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

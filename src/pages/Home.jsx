import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, CalendarSearch, ClipboardCheck, PartyPopper, Users, CalendarDays, MapPinned } from "lucide-react";
import EventCard from "../components/EventCard";
import { useEvents } from "../context/EventContext";
import { CATEGORIES, CATEGORY_META } from "../data/events";
import { isPast, parseDate } from "../utils/format";

export default function Home() {
  const { events, stats } = useEvents();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const upcoming = useMemo(
    () => events.filter((e) => !isPast(e)).sort((a, b) => parseDate(a.date, a.time) - parseDate(b.date, b.time)),
    [events]
  );
  const featured = upcoming.filter((e) => e.featured).slice(0, 3);
  const soon = upcoming.slice(0, 6);
  const counts = useMemo(() => {
    const c = {};
    upcoming.forEach((e) => { c[e.category] = (c[e.category] || 0) + 1; });
    return c;
  }, [upcoming]);
  const cities = new Set(upcoming.map((e) => e.city)).size;

  const onSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/events?q=${encodeURIComponent(query.trim())}` : "/events");
  };

  return (
    <>
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">🎉 {upcoming.length} upcoming events near you</span>
            <h1>Find events you'll <em>actually</em> remember.</h1>
            <p className="lead">From summits and festivals to workshops and marathons — browse, register and manage every ticket in one place.</p>
            <form className="hero-search" onSubmit={onSearch} role="search">
              <Search size={20} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues or categories…"
                aria-label="Search events"
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </form>
            <div className="hero-tags">
              {["Technology", "Music", "Sports"].map((c) => (
                <Link key={c} to={`/events?category=${c}`} className="tag">{CATEGORY_META[c].emoji} {c}</Link>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-hidden={featured.length === 0}>
            {featured[0] && (
              <Link to={`/events/${featured[0].id}`} className="hero-card">
                <img src={featured[0].image} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className="hero-card-info">
                  <span className="badge badge-cat">{featured[0].category}</span>
                  <strong>{featured[0].title}</strong>
                  <small>{featured[0].venue}</small>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          <div><CalendarDays size={22} /><b>{upcoming.length}</b><span>Upcoming events</span></div>
          <div><MapPinned size={22} /><b>{cities}</b><span>Cities</span></div>
          <div><Users size={22} /><b>{stats.tickets}</b><span>Tickets booked here</span></div>
          <div><PartyPopper size={22} /><b>{CATEGORIES.length}</b><span>Categories</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Browse</span><h2>Explore by category</h2></div>
            <Link to="/events" className="link-arrow">All events <ArrowRight size={16} /></Link>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/events?category=${c}`} className="cat-card" style={{ "--from": CATEGORY_META[c].from, "--to": CATEGORY_META[c].to }}>
                <span className="cat-emoji">{CATEGORY_META[c].emoji}</span>
                <b>{c}</b>
                <small>{counts[c] || 0} event{counts[c] === 1 ? "" : "s"}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <div className="section-head">
              <div><span className="eyebrow">Hand-picked</span><h2>Featured events</h2></div>
            </div>
            <div className="grid-3">{featured.map((e) => <EventCard key={e.id} event={e} />)}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Don't miss out</span><h2>Happening soon</h2></div>
            <Link to="/events" className="link-arrow">View all <ArrowRight size={16} /></Link>
          </div>
          {soon.length ? (
            <div className="grid-3">{soon.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <p className="muted">No upcoming events right now — check back soon.</p>
          )}
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head center"><div><span className="eyebrow">Simple</span><h2>How it works</h2></div></div>
          <div className="steps-grid">
            {[
              { i: CalendarSearch, t: "1. Discover", d: "Search or filter events by category, price and date." },
              { i: ClipboardCheck, t: "2. Register", d: "Fill a quick form, pick your tickets and confirm." },
              { i: PartyPopper, t: "3. Enjoy", d: "Find every ticket in My Events and show up ready." },
            ].map(({ i: Icon, t, d }) => (
              <div className="step-card" key={t}><span className="step-icon"><Icon size={24} /></span><h3>{t}</h3><p className="muted">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <div><h2>Ready for your next experience?</h2><p>Seats go fast. Reserve yours today.</p></div>
            <Link to="/events" className="btn btn-light btn-lg">Browse events <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

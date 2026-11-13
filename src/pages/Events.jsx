import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SearchX, SlidersHorizontal } from "lucide-react";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { useEvents } from "../context/EventContext";
import { CATEGORIES, CATEGORY_META } from "../data/events";
import { isPast, parseDate } from "../utils/format";

const PAGE = 9;

export default function Events() {
  const { events, saved } = useEvents();
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE);
  const [showFilters, setShowFilters] = useState(false);

  const q = params.get("q") || "";
  const category = params.get("category") || "All";
  const price = params.get("price") || "any";
  const sort = params.get("sort") || "date";
  const when = params.get("when") || "upcoming";
  const onlySaved = params.get("saved") === "1";

  const setParam = (key, value, def) => {
    const next = new URLSearchParams(params);
    if (!value || value === def) next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
    setVisible(PAGE);
  };

  const categories = useMemo(() => {
    const extra = [...new Set(events.map((e) => e.category))].filter((c) => !CATEGORIES.includes(c));
    return ["All", ...CATEGORIES, ...extra];
  }, [events]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = events.filter((e) => {
      if (when === "upcoming" && isPast(e)) return false;
      if (when === "past" && !isPast(e)) return false;
      if (category !== "All" && e.category !== category) return false;
      if (price === "free" && Number(e.price) > 0) return false;
      if (price === "paid" && Number(e.price) === 0) return false;
      if (price === "under500" && Number(e.price) >= 500) return false;
      if (onlySaved && !saved.includes(e.id)) return false;
      if (!term) return true;
      return [e.title, e.category, e.venue, e.city, e.organizer, e.description].some((f) => String(f || "").toLowerCase().includes(term));
    });
    const by = {
      date: (a, b) => parseDate(a.date, a.time) - parseDate(b.date, b.time),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.title.localeCompare(b.title),
    }[sort] || (() => 0);
    list = [...list].sort(by);
    if (when === "past") list.reverse();
    return list;
  }, [events, q, category, price, sort, when, onlySaved, saved]);

  const activeFilters = [q, category !== "All", price !== "any", sort !== "date", when !== "upcoming", onlySaved].filter(Boolean).length;
  const clearAll = () => { setParams({}, { replace: true }); setVisible(PAGE); };

  return (
    <>
      <PageHeader eyebrow="Events" title="Find your next event" subtitle="Search, filter by category and book your tickets." />
      <div className="container section-sm">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setParam("q", e.target.value)} placeholder="Search by title, venue, city…" aria-label="Search events" />
            {q && <button className="icon-btn" aria-label="Clear search" onClick={() => setParam("q", "")}><X size={16} /></button>}
          </div>
          <button className="btn btn-ghost filter-toggle" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            <SlidersHorizontal size={16} /> Filters {activeFilters > 0 && <span className="count-pill">{activeFilters}</span>}
          </button>
          <div className={`filters ${showFilters ? "open" : ""}`}>
            <label>Price
              <select value={price} onChange={(e) => setParam("price", e.target.value, "any")}>
                <option value="any">Any price</option><option value="free">Free</option><option value="paid">Paid</option><option value="under500">Under ₹500</option>
              </select>
            </label>
            <label>When
              <select value={when} onChange={(e) => setParam("when", e.target.value, "upcoming")}>
                <option value="upcoming">Upcoming</option><option value="past">Past</option><option value="all">All</option>
              </select>
            </label>
            <label>Sort by
              <select value={sort} onChange={(e) => setParam("sort", e.target.value, "date")}>
                <option value="date">Date</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option>
              </select>
            </label>
            <button className={`btn btn-sm ${onlySaved ? "btn-primary" : "btn-ghost"}`} onClick={() => setParam("saved", onlySaved ? "" : "1")} aria-pressed={onlySaved}>♥ Saved only</button>
          </div>
        </div>

        <div className="chips" role="tablist" aria-label="Categories">
          {categories.map((c) => (
            <button key={c} role="tab" aria-selected={category === c} className={`chip ${category === c ? "active" : ""}`} onClick={() => setParam("category", c, "All")}>
              {c !== "All" && CATEGORY_META[c] ? `${CATEGORY_META[c].emoji} ` : ""}{c}
            </button>
          ))}
        </div>

        <div className="results-bar">
          <p><b>{filtered.length}</b> event{filtered.length === 1 ? "" : "s"} found{category !== "All" ? ` in ${category}` : ""}{q ? ` for “${q}”` : ""}</p>
          {activeFilters > 0 && <button className="link-btn" onClick={clearAll}>Clear all filters</button>}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No events match your search" text="Try a different keyword or remove a filter.">
            <button className="btn btn-primary" onClick={clearAll}>Reset filters</button>
          </EmptyState>
        ) : (
          <>
            <div className="grid-3">{filtered.slice(0, visible).map((e) => <EventCard key={e.id} event={e} />)}</div>
            {visible < filtered.length && (
              <div className="center-row"><button className="btn btn-ghost btn-lg" onClick={() => setVisible((v) => v + PAGE)}>Load more ({filtered.length - visible} left)</button></div>
            )}
          </>
        )}
      </div>
    </>
  );
}

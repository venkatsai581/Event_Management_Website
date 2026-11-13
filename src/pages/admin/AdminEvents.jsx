import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, X, Star } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useEvents } from "../../context/EventContext";
import { CATEGORIES } from "../../data/events";
import { formatDate, formatTime, isPast, money } from "../../utils/format";

const blank = () => ({
  title: "", category: CATEGORIES[0], description: "", image: "", date: "", time: "10:00",
  venue: "", city: "Hyderabad", price: 0, capacity: 100, organizer: "", duration: "", featured: false,
});

function Field({ name, label, children, full, err }) {
  return (
    <div className={`field ${err[name] ? "invalid" : ""} ${full ? "full" : ""}`}>
      <label htmlFor={`ev-${name}`}>{label}</label>{children}{err[name] && <span className="err">{err[name]}</span>}
    </div>
  );
}

function EventForm({ initial, soldTickets, onSave, onClose, editing }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const v = {};
    if (f.title.trim().length < 3) v.title = "Title must be at least 3 characters.";
    if (f.description.trim().length < 20) v.description = "Description must be at least 20 characters.";
    if (!f.date) v.date = "Choose a date.";
    if (!f.time) v.time = "Choose a time.";
    if (!f.venue.trim()) v.venue = "Venue is required.";
    if (!f.city.trim()) v.city = "City is required.";
    if (f.price === "" || Number(f.price) < 0 || Number.isNaN(Number(f.price))) v.price = "Price must be 0 or more.";
    if (!Number.isInteger(Number(f.capacity)) || Number(f.capacity) < 1) v.capacity = "Capacity must be a whole number ≥ 1.";
    else if (Number(f.capacity) < soldTickets) v.capacity = `Capacity can't be below tickets already sold (${soldTickets}).`;
    if (f.image && !/^https?:\/\//i.test(f.image.trim())) v.image = "Image must be a full http(s) URL.";
    setErr(v);
    if (Object.keys(v).length) return;
    onSave({
      ...f, title: f.title.trim(), description: f.description.trim(), venue: f.venue.trim(), city: f.city.trim(),
      organizer: f.organizer.trim() || "Eventify", duration: f.duration.trim() || "—", image: f.image.trim(),
      price: Number(f.price), capacity: Number(f.capacity),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal modal-lg form" onSubmit={submit} noValidate onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editing ? "Edit event" : "Create event"}>
        <div className="modal-head"><h3>{editing ? "Edit event" : "Create new event"}</h3><button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        <div className="form-grid">
          <Field err={err} name="title" label="Title" full><input id="ev-title" value={f.title} onChange={set("title")} placeholder="Event title" /></Field>
          <Field err={err} name="category" label="Category"><select id="ev-category" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field err={err} name="organizer" label="Organizer"><input id="ev-organizer" value={f.organizer} onChange={set("organizer")} placeholder="Organizer name" /></Field>
          <Field err={err} name="date" label="Date"><input id="ev-date" type="date" value={f.date} onChange={set("date")} /></Field>
          <Field err={err} name="time" label="Start time"><input id="ev-time" type="time" value={f.time} onChange={set("time")} /></Field>
          <Field err={err} name="venue" label="Venue"><input id="ev-venue" value={f.venue} onChange={set("venue")} placeholder="Venue name" /></Field>
          <Field err={err} name="city" label="City"><input id="ev-city" value={f.city} onChange={set("city")} /></Field>
          <Field err={err} name="price" label="Ticket price (₹, 0 = free)"><input id="ev-price" type="number" min="0" step="1" value={f.price} onChange={set("price")} /></Field>
          <Field err={err} name="capacity" label="Capacity"><input id="ev-capacity" type="number" min="1" step="1" value={f.capacity} onChange={set("capacity")} /></Field>
          <Field err={err} name="duration" label="Duration"><input id="ev-duration" value={f.duration} onChange={set("duration")} placeholder="e.g. 4 Hours" /></Field>
          <Field err={err} name="image" label="Banner image URL"><input id="ev-image" value={f.image} onChange={set("image")} placeholder="https://…" /></Field>
          <Field err={err} name="description" label="Description" full><textarea id="ev-description" rows={4} value={f.description} onChange={set("description")} /></Field>
          <div className="field check full"><label><input type="checkbox" checked={f.featured} onChange={set("featured")} /> Show as featured on the home page</label></div>
        </div>
        <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">{editing ? "Save changes" : "Create event"}</button></div>
      </form>
    </div>
  );
}

export default function AdminEvents() {
  const { events, addEvent, updateEvent, deleteEvent, getAvailableTickets, activeBookings, notify, settings } = useEvents();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState(null); // null | "new" | event
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    if (params.get("new") === "1") { setEditing("new"); setParams({}, { replace: true }); }
  }, [params, setParams]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return events
      .filter((e) => (cat === "All" || e.category === cat) && (!t || [e.title, e.venue, e.city, e.organizer].some((x) => String(x).toLowerCase().includes(t))))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [events, q, cat]);

  const sold = (id) => activeBookings.filter((b) => b.eventId === id).reduce((s, b) => s + Number(b.ticketQuantity), 0);

  const save = (data) => {
    if (editing === "new") { const ev = addEvent(data); notify(`“${ev.title}” created`); }
    else { updateEvent(editing.id, data); notify("Event updated"); }
    setEditing(null);
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Events</h1><p className="muted">{events.length} total · create, edit or remove events.</p></div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}><Plus size={16} /> New event</button>
      </div>

      <div className="toolbar admin-toolbar">
        <div className="search-box"><Search size={18} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" aria-label="Search events" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category"><option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>

      <div className="panel flush">
        {list.length === 0 ? <p className="muted pad">No events found.</p> : (
          <div className="table-wrap">
            <table className="table stack">
              <thead><tr><th>Event</th><th>Category</th><th>Date</th><th>Price</th><th>Sold</th><th>Status</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {list.map((e) => {
                  const s = sold(e.id); const past = isPast(e);
                  return (
                    <tr key={e.id}>
                      <td data-label="Event"><Link to={`/events/${e.id}`} className="cell-title">{e.featured && <Star size={13} className="star" />}{e.title}</Link><small className="muted">{e.venue}, {e.city}</small></td>
                      <td data-label="Category">{e.category}</td>
                      <td data-label="Date">{formatDate(e.date)}<small className="muted">{formatTime(e.time)}</small></td>
                      <td data-label="Price">{money(e.price, settings.currency)}</td>
                      <td data-label="Sold">{s}/{e.capacity}</td>
                      <td data-label="Status"><span className={`status-pill ${past ? "gray" : s >= e.capacity ? "red" : "green"}`}>{past ? "Ended" : s >= e.capacity ? "Sold out" : "Open"}</span></td>
                      <td data-label="Actions" className="right"><div className="btn-row end">
                        <button className="icon-btn" aria-label={`Edit ${e.title}`} onClick={() => setEditing(e)}><Pencil size={16} /></button>
                        <button className="icon-btn danger" aria-label={`Delete ${e.title}`} onClick={() => setToDelete(e)}><Trash2 size={16} /></button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <EventForm editing={editing !== "new"} initial={editing === "new" ? blank() : { ...blank(), ...editing }} soldTickets={editing === "new" ? 0 : sold(editing.id)} onSave={save} onClose={() => setEditing(null)} />
      )}
      <ConfirmDialog open={Boolean(toDelete)} danger title="Delete this event?" confirmText="Delete event"
        message={toDelete ? `“${toDelete.title}” and its ${sold(toDelete.id)} active booking ticket(s) will be permanently removed.` : ""}
        onConfirm={() => { deleteEvent(toDelete.id); notify("Event deleted", "info"); setToDelete(null); }} onCancel={() => setToDelete(null)} />
    </>
  );
}

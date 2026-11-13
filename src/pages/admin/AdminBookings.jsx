import { useMemo, useState } from "react";
import { Search, Download, XCircle, Trash2, Inbox } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { useEvents } from "../../context/EventContext";
import { formatDateTime, money } from "../../utils/format";

export default function AdminBookings() {
  const { bookings, events, getEventById, cancelBooking, deleteBooking, notify, settings } = useEvents();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [eventId, setEventId] = useState("All");
  const [action, setAction] = useState(null); // {type, b}

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return bookings.filter((b) =>
      (status === "All" || b.status === status) && (eventId === "All" || b.eventId === eventId) &&
      (!t || [b.bookingId, b.attendee.name, b.attendee.email, b.attendee.phone, getEventById(b.eventId)?.title].some((x) => String(x || "").toLowerCase().includes(t)))
    );
  }, [bookings, q, status, eventId, getEventById]);

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Booking ID", "Event", "Name", "Email", "Phone", "Tickets", "Total", "Status", "Booked at"];
    const rows = list.map((b) => [b.bookingId, getEventById(b.eventId)?.title || "Deleted event", b.attendee.name, b.attendee.email, b.attendee.phone, b.ticketQuantity, b.totalPrice, b.status, b.bookingDate]);
    const csv = [head, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `eventify-bookings-${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    notify(`Exported ${list.length} booking(s)`);
  };

  const run = () => {
    if (action.type === "cancel") { const r = cancelBooking(action.b.bookingId); notify(r.message, r.success ? "success" : "error"); }
    else { deleteBooking(action.b.bookingId); notify("Booking deleted", "info"); }
    setAction(null);
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Bookings</h1><p className="muted">{bookings.length} total registrations.</p></div>
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!list.length}><Download size={16} /> Export CSV</button>
      </div>

      <div className="toolbar admin-toolbar">
        <div className="search-box"><Search size={18} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, ID…" aria-label="Search bookings" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option>All</option><option>Confirmed</option><option>Cancelled</option></select>
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Event"><option value="All">All events</option>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>
      </div>

      <div className="panel flush">
        {list.length === 0 ? <EmptyState icon={Inbox} title="No bookings found" text="Bookings made on the public site will appear here." /> : (
          <div className="table-wrap">
            <table className="table stack">
              <thead><tr><th>Booking</th><th>Attendee</th><th>Event</th><th>Qty</th><th>Total</th><th>Status</th><th>Booked</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.bookingId}>
                    <td data-label="Booking" className="mono">{b.bookingId}</td>
                    <td data-label="Attendee">{b.attendee.name}<small className="muted">{b.attendee.email}</small></td>
                    <td data-label="Event">{getEventById(b.eventId)?.title || "Deleted event"}</td>
                    <td data-label="Qty">{b.ticketQuantity}</td>
                    <td data-label="Total">{money(b.totalPrice, settings.currency)}</td>
                    <td data-label="Status"><span className={`status-pill ${b.status === "Cancelled" ? "red" : "green"}`}>{b.status}</span></td>
                    <td data-label="Booked">{formatDateTime(b.bookingDate)}</td>
                    <td data-label="Actions" className="right"><div className="btn-row end">
                      {b.status !== "Cancelled" && <button className="icon-btn" aria-label="Cancel booking" title="Cancel booking" onClick={() => setAction({ type: "cancel", b })}><XCircle size={16} /></button>}
                      <button className="icon-btn danger" aria-label="Delete booking" title="Delete booking" onClick={() => setAction({ type: "delete", b })}><Trash2 size={16} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={Boolean(action)} danger title={action?.type === "cancel" ? "Cancel this booking?" : "Delete this booking?"} confirmText={action?.type === "cancel" ? "Cancel booking" : "Delete"}
        message={action ? (action.type === "cancel" ? `Release ${action.b.ticketQuantity} ticket(s) held by ${action.b.attendee.name}.` : `Permanently remove booking ${action.b.bookingId}.`) : ""}
        onConfirm={run} onCancel={() => setAction(null)} />
    </>
  );
}

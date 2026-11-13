import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import seedEvents from "../data/events";
import { KEYS, readJSON, writeJSON, removeKey } from "../utils/storage";
import { EMAIL_RE, PHONE_RE, isPast } from "../utils/format";

const EventContext = createContext(null);

export const DEFAULT_SETTINGS = {
  siteName: "Eventify",
  tagline: "Discover. Register. Experience.",
  contactEmail: "hello@eventify.com",
  currency: "₹",
  maxTickets: 10,
  registrationsOpen: true,
  sessionHours: 8,
};

export const DEFAULT_PROFILE = {
  name: "",
  email: "",
  phone: "",
  city: "",
  bio: "",
  interests: [],
};

const isEvent = (e) =>
  e && typeof e.id === "string" && typeof e.title === "string" && typeof e.date === "string";

const isBooking = (b) =>
  b &&
  typeof b.bookingId === "string" &&
  typeof b.eventId === "string" &&
  b.attendee &&
  typeof b.attendee.email === "string" &&
  Number(b.ticketQuantity) > 0;

const loadList = (key, fallback, guard) => {
  const data = readJSON(key, null);
  return Array.isArray(data) ? data.filter(guard) : fallback;
};

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => loadList(KEYS.events, seedEvents, isEvent));
  const [bookings, setBookings] = useState(() => loadList(KEYS.bookings, [], isBooking));
  const [saved, setSaved] = useState(() => {
    const s = readJSON(KEYS.saved, []);
    return Array.isArray(s) ? s : [];
  });
  const [profile, setProfileState] = useState(() => ({ ...DEFAULT_PROFILE, ...readJSON(KEYS.profile, {}) }));
  const [settings, setSettingsState] = useState(() => ({ ...DEFAULT_SETTINGS, ...readJSON(KEYS.settings, {}) }));
  const [toasts, setToasts] = useState([]);

  // Persist every slice whenever it changes.
  useEffect(() => { writeJSON(KEYS.events, events); }, [events]);
  useEffect(() => { writeJSON(KEYS.bookings, bookings); }, [bookings]);
  useEffect(() => { writeJSON(KEYS.saved, saved); }, [saved]);
  useEffect(() => { writeJSON(KEYS.profile, profile); }, [profile]);
  useEffect(() => { writeJSON(KEYS.settings, settings); }, [settings]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEYS.events) setEvents(loadList(KEYS.events, seedEvents, isEvent));
      if (e.key === KEYS.bookings) setBookings(loadList(KEYS.bookings, [], isBooking));
      if (e.key === KEYS.settings) setSettingsState({ ...DEFAULT_SETTINGS, ...readJSON(KEYS.settings, {}) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------- toasts ---------- */
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t.slice(-3), { id, message, type }]);
    setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  /* ---------- derived ---------- */
  const activeBookings = useMemo(() => bookings.filter((b) => b.status !== "Cancelled"), [bookings]);

  const getEventById = useCallback((id) => events.find((e) => e.id === id), [events]);

  const getAvailableTickets = useCallback((eventId) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return 0;
    const booked = activeBookings
      .filter((b) => b.eventId === eventId)
      .reduce((sum, b) => sum + Number(b.ticketQuantity), 0);
    return Math.max(0, Number(ev.capacity) - booked);
  }, [events, activeBookings]);

  /* ---------- registration ---------- */
  const registerForEvent = useCallback((eventId, attendee, quantity) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return { success: false, message: "Event not found." };
    if (!settings.registrationsOpen) return { success: false, message: "Registrations are temporarily closed." };
    if (isPast(ev)) return { success: false, message: "Registration for this event has closed." };

    const name = String(attendee?.name || "").trim();
    const email = String(attendee?.email || "").trim().toLowerCase();
    const phone = String(attendee?.phone || "").trim();
    const qty = Number(quantity);

    if (name.length < 2) return { success: false, message: "Please enter your full name." };
    if (!EMAIL_RE.test(email)) return { success: false, message: "Please enter a valid email address." };
    if (!PHONE_RE.test(phone)) return { success: false, message: "Please enter a valid phone number." };
    if (!Number.isInteger(qty) || qty < 1 || qty > settings.maxTickets)
      return { success: false, message: `Choose between 1 and ${settings.maxTickets} tickets.` };
    if (activeBookings.some((b) => b.eventId === eventId && b.attendee.email.toLowerCase() === email))
      return { success: false, message: "This email is already registered for this event." };

    const available = getAvailableTickets(eventId);
    if (qty > available)
      return { success: false, message: available > 0 ? `Only ${available} ticket(s) left.` : "Sorry, this event is sold out." };

    const booking = {
      bookingId: `BK-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
      eventId,
      attendee: { name, email, phone, note: String(attendee?.note || "").trim() },
      ticketQuantity: qty,
      unitPrice: Number(ev.price),
      totalPrice: Number(ev.price) * qty,
      bookingDate: new Date().toISOString(),
      status: "Confirmed",
    };
    setBookings((cur) => [booking, ...cur]);
    return { success: true, message: "You're in! Registration confirmed.", booking };
  }, [events, settings, activeBookings, getAvailableTickets]);

  const cancelBooking = useCallback((bookingId) => {
    const b = bookings.find((x) => x.bookingId === bookingId && x.status !== "Cancelled");
    if (!b) return { success: false, message: "Active booking not found." };
    setBookings((cur) =>
      cur.map((x) => (x.bookingId === bookingId ? { ...x, status: "Cancelled", cancelledAt: new Date().toISOString() } : x))
    );
    return { success: true, message: "Booking cancelled." };
  }, [bookings]);

  const deleteBooking = useCallback((bookingId) => setBookings((cur) => cur.filter((b) => b.bookingId !== bookingId)), []);
  const clearBookings = useCallback(() => setBookings([]), []);

  /* ---------- saved events ---------- */
  const toggleSaved = useCallback((eventId) => {
    setSaved((cur) => (cur.includes(eventId) ? cur.filter((id) => id !== eventId) : [...cur, eventId]));
  }, []);
  const isSaved = useCallback((id) => saved.includes(id), [saved]);

  /* ---------- admin CRUD ---------- */
  const addEvent = useCallback((data) => {
    const ev = { ...data, id: `EVT${Date.now().toString(36).toUpperCase()}` };
    setEvents((cur) => [ev, ...cur]);
    return ev;
  }, []);

  const updateEvent = useCallback((id, data) => {
    setEvents((cur) => cur.map((e) => (e.id === id ? { ...e, ...data, id } : e)));
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents((cur) => cur.filter((e) => e.id !== id));
    setBookings((cur) => cur.filter((b) => b.eventId !== id));
    setSaved((cur) => cur.filter((x) => x !== id));
  }, []);

  /* ---------- profile / settings ---------- */
  const updateProfile = useCallback((data) => setProfileState((p) => ({ ...p, ...data })), []);
  const updateSettings = useCallback((data) => setSettingsState((s) => ({ ...s, ...data })), []);
  const resetSettings = useCallback(() => setSettingsState(DEFAULT_SETTINGS), []);

  const resetDemoData = useCallback(() => {
    setEvents(seedEvents);
    setBookings([]);
    setSaved([]);
    [KEYS.events, KEYS.bookings, KEYS.saved].forEach(removeKey);
  }, []);

  const stats = useMemo(() => {
    const tickets = activeBookings.reduce((s, b) => s + Number(b.ticketQuantity), 0);
    const revenue = activeBookings.reduce((s, b) => s + Number(b.totalPrice || 0), 0);
    return { bookings: activeBookings.length, tickets, revenue };
  }, [activeBookings]);

  const value = useMemo(() => ({
    events, bookings, activeBookings, saved, profile, settings, toasts, stats,
    getEventById, getAvailableTickets, registerForEvent, cancelBooking, deleteBooking, clearBookings,
    toggleSaved, isSaved, addEvent, updateEvent, deleteEvent,
    updateProfile, updateSettings, resetSettings, resetDemoData, notify, dismissToast,
  }), [events, bookings, activeBookings, saved, profile, settings, toasts, stats,
    getEventById, getAvailableTickets, registerForEvent, cancelBooking, deleteBooking, clearBookings,
    toggleSaved, isSaved, addEvent, updateEvent, deleteEvent,
    updateProfile, updateSettings, resetSettings, resetDemoData, notify, dismissToast]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used inside <EventProvider>.");
  return ctx;
}

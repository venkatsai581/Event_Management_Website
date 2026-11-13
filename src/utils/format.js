export const parseDate = (date, time = "00:00") => {
  const t = /^\d{1,2}:\d{2}$/.test(time) ? time : "00:00";
  return new Date(`${date}T${t.padStart(5, "0")}:00`);
};

export const formatDate = (date, opts = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = parseDate(date);
  return Number.isNaN(d.getTime()) ? "TBA" : d.toLocaleDateString("en-IN", opts);
};

export const formatDateLong = (date) =>
  formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const dayParts = (date) => {
  const d = parseDate(date);
  if (Number.isNaN(d.getTime())) return { day: "--", month: "TBA" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
  };
};

export const formatTime = (time) => {
  if (!/^\d{1,2}:\d{2}$/.test(time || "")) return time || "TBA";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const formatDateTime = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

export const money = (amount, symbol = "₹") =>
  Number(amount) > 0 ? `${symbol}${Number(amount).toLocaleString("en-IN")}` : "Free";

export const isPast = (event) => {
  const d = new Date(`${event.date}T23:59:59`);
  return Number.isNaN(d.getTime()) ? false : d < new Date();
};

export const daysUntil = (date) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const d = parseDate(date);
  return Math.round((d - start) / 86400000);
};

export const countdownLabel = (date) => {
  const n = daysUntil(date);
  if (n < 0) return "Ended";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `In ${n} days`;
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "U";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[0-9+\-\s()]{7,18}$/;

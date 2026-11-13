// Defensive localStorage helpers: never throw (private mode, quota, bad JSON).
export const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const removeKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const KEYS = {
  events: "eventify_events_v2",
  bookings: "eventify_bookings_v2",
  profile: "eventify_profile_v2",
  saved: "eventify_saved_v2",
  settings: "eventify_settings_v2",
  adminSession: "eventify_admin_session_v2",
  adminAccount: "eventify_admin_account_v2",
};

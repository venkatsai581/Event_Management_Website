import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EMAIL_RE } from "../utils/format";

/*
 * Admin authentication (front-end demo).
 * Passwords are stored as salted SHA-256 hashes, the session expires after
 * SESSION_HOURS, and repeated failed logins trigger a temporary lockout.
 * NOTE: a purely client-side app cannot be truly secure — connect a real
 * backend before using this with real data.
 */
const ACCOUNT_KEY = "eventify_admin_account_v1";
const SESSION_KEY = "eventify_admin_session_v1";
const LOCK_KEY = "eventify_admin_lock_v1";
const SESSION_HOURS = 8;
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

const DEFAULT_ACCOUNT = {
  name: "Eventify Administrator",
  email: "admin@eventify.com",
  phone: "+91 98765 43210",
  role: "Super Admin",
  // sha256("eventify::" + "Admin@123")
  passwordHash: "fb309cd3fe2a76feb46d5ee69c6445bb803d36e204267b74a12066166465dc8c",
  createdAt: new Date().toISOString(),
  passwordChangedAt: null,
};

async function hash(password) {
  const data = new TextEncoder().encode(`eventify::${password}`);
  if (window.crypto?.subtle) {
    const buf = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for non-secure contexts (plain-HTTP LAN testing)
  let h = 5381;
  for (const b of data) h = (h * 33) ^ b;
  return `weak-${(h >>> 0).toString(16)}`;
}

const readJSON = (storage, key) => {
  try {
    const v = storage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const writeJSON = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const loadAccount = () => {
  const saved = readJSON(localStorage, ACCOUNT_KEY);
  if (saved?.email && saved?.passwordHash) return saved;
  writeJSON(localStorage, ACCOUNT_KEY, DEFAULT_ACCOUNT);
  return DEFAULT_ACCOUNT;
};

const loadSession = () => {
  const s = readJSON(localStorage, SESSION_KEY) || readJSON(sessionStorage, SESSION_KEY);
  if (!s || !s.expiresAt || new Date(s.expiresAt) < new Date()) return null;
  return s;
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(loadAccount);
  const [session, setSession] = useState(loadSession);
  const accountRef = useRef(account);
  accountRef.current = account;

  // Expire the session automatically.
  useEffect(() => {
    if (!session) return undefined;
    const ms = new Date(session.expiresAt) - Date.now();
    const t = setTimeout(() => {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      setSession(null);
    }, Math.max(0, Math.min(ms, 2 ** 31 - 1)));
    return () => clearTimeout(t);
  }, [session]);

  // Keep tabs in sync (logout in one tab logs out the others).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setSession(loadSession());
      if (e.key === ACCOUNT_KEY) setAccount(loadAccount());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getLockRemaining = useCallback(() => {
    const lock = readJSON(localStorage, LOCK_KEY);
    if (!lock?.until) return 0;
    return Math.max(0, Math.ceil((lock.until - Date.now()) / 1000));
  }, []);

  const login = useCallback(
    async (email, password, remember = true) => {
      const remaining = getLockRemaining();
      if (remaining > 0)
        return { success: false, locked: true, message: `Too many attempts. Try again in ${remaining}s.` };

      const acc = accountRef.current;
      const ok =
        String(email).trim().toLowerCase() === acc.email.toLowerCase() &&
        (await hash(password)) === acc.passwordHash;

      if (!ok) {
        const lock = readJSON(localStorage, LOCK_KEY) || { count: 0 };
        const count = (lock.count || 0) + 1;
        if (count >= MAX_ATTEMPTS) {
          writeJSON(localStorage, LOCK_KEY, { count: 0, until: Date.now() + LOCK_SECONDS * 1000 });
          return { success: false, locked: true, message: `Too many failed attempts. Locked for ${LOCK_SECONDS}s.` };
        }
        writeJSON(localStorage, LOCK_KEY, { count });
        return {
          success: false,
          message: `Invalid email or password. ${MAX_ATTEMPTS - count} attempt(s) remaining.`,
        };
      }

      localStorage.removeItem(LOCK_KEY);
      const now = new Date();
      const next = {
        email: acc.email,
        loginAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + SESSION_HOURS * 3600 * 1000).toISOString(),
        remember,
      };
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      writeJSON(remember ? localStorage : sessionStorage, SESSION_KEY, next);
      setSession(next);
      return { success: true };
    },
    [getLockRemaining]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const updateProfile = useCallback(({ name, email, phone }) => {
    const n = String(name || "").trim();
    const e = String(email || "").trim().toLowerCase();
    if (n.length < 2) return { success: false, message: "Name must be at least 2 characters." };
    if (!EMAIL_RE.test(e)) return { success: false, message: "Enter a valid email address." };
    const next = { ...accountRef.current, name: n, email: e, phone: String(phone || "").trim() };
    writeJSON(localStorage, ACCOUNT_KEY, next);
    setAccount(next);
    setSession((s) => {
      if (!s) return s;
      const updated = { ...s, email: e };
      writeJSON(s.remember ? localStorage : sessionStorage, SESSION_KEY, updated);
      return updated;
    });
    return { success: true, message: "Profile updated." };
  }, []);

  const changePassword = useCallback(async (current, next, confirm) => {
    if ((await hash(current)) !== accountRef.current.passwordHash)
      return { success: false, field: "current", message: "Current password is incorrect." };
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/[0-9]/.test(next))
      return { success: false, field: "next", message: "Use at least 8 characters with letters and numbers." };
    if (next !== confirm) return { success: false, field: "confirm", message: "Passwords do not match." };
    if (next === current) return { success: false, field: "next", message: "New password must differ from the current one." };
    const updated = { ...accountRef.current, passwordHash: await hash(next), passwordChangedAt: new Date().toISOString() };
    writeJSON(localStorage, ACCOUNT_KEY, updated);
    setAccount(updated);
    return { success: true, message: "Password changed successfully." };
  }, []);

  const resetAccount = useCallback(() => {
    writeJSON(localStorage, ACCOUNT_KEY, DEFAULT_ACCOUNT);
    setAccount(DEFAULT_ACCOUNT);
  }, []);

  const value = useMemo(
    () => ({
      admin: session ? account : null,
      account,
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
      updateProfile,
      changePassword,
      resetAccount,
      getLockRemaining,
      sessionHours: SESSION_HOURS,
    }),
    [account, session, login, logout, updateProfile, changePassword, resetAccount, getLockRemaining]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

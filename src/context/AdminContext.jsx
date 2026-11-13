import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KEYS, readJSON, writeJSON, removeKey } from "../utils/storage";
import { EMAIL_RE, PHONE_RE } from "../utils/format";

/*
 * DEMO AUTHENTICATION — frontend only.
 * The default admin is admin@eventify.com / Admin@123. Credentials live in
 * this browser's localStorage, so this protects the UI, not real data. A
 * production app must verify credentials on a server.
 */
const DEFAULT_ACCOUNT = {
  name: "Eventify Administrator",
  email: "admin@eventify.com",
  phone: "",
  role: "Super Admin",
  passwordHash: null, // null = still using the default password
  createdAt: new Date("2026-01-01").toISOString(),
};
const DEFAULT_PASSWORD = "Admin@123";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30000;

const sha256 = async (text) => {
  if (!globalThis.crypto?.subtle) return `plain:${text}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const AdminContext = createContext(null);

const readSession = () => {
  const s = readJSON(KEYS.adminSession, null);
  if (!s || !s.email || !s.expiresAt) return null;
  if (Date.now() > s.expiresAt) { removeKey(KEYS.adminSession); return null; }
  return s;
};

export function AdminProvider({ children, sessionHours = 8 }) {
  const [account, setAccount] = useState(() => ({ ...DEFAULT_ACCOUNT, ...readJSON(KEYS.adminAccount, {}) }));
  const [session, setSession] = useState(readSession);
  const [attempts, setAttempts] = useState({ count: 0, lockedUntil: 0 });

  useEffect(() => { writeJSON(KEYS.adminAccount, account); }, [account]);

  // Auto sign-out when the session expires, and sync logout across tabs.
  useEffect(() => {
    if (!session) return undefined;
    const ms = session.expiresAt - Date.now();
    const timer = setTimeout(() => { removeKey(KEYS.adminSession); setSession(null); }, Math.max(0, Math.min(ms, 2 ** 31 - 1)));
    const onStorage = (e) => { if (e.key === KEYS.adminSession) setSession(readSession()); };
    window.addEventListener("storage", onStorage);
    return () => { clearTimeout(timer); window.removeEventListener("storage", onStorage); };
  }, [session]);

  const verifyPassword = useCallback(async (password) => {
    if (!account.passwordHash) return password === DEFAULT_PASSWORD;
    return (await sha256(password)) === account.passwordHash;
  }, [account.passwordHash]);

  const login = useCallback(async (email, password, remember = false) => {
    if (Date.now() < attempts.lockedUntil) {
      const secs = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
      return { success: false, message: `Too many attempts. Try again in ${secs}s.` };
    }
    const emailOk = email.trim().toLowerCase() === account.email.toLowerCase();
    const passOk = emailOk && (await verifyPassword(password));
    if (!passOk) {
      const count = attempts.count + 1;
      const locked = count >= MAX_ATTEMPTS;
      setAttempts({ count: locked ? 0 : count, lockedUntil: locked ? Date.now() + LOCK_MS : 0 });
      return {
        success: false,
        message: locked ? "Too many failed attempts. Locked for 30 seconds." : `Invalid email or password. ${MAX_ATTEMPTS - count} attempt(s) left.`,
      };
    }
    const hours = remember ? 24 * 7 : sessionHours;
    const s = { email: account.email, loginTime: new Date().toISOString(), expiresAt: Date.now() + hours * 3600000 };
    writeJSON(KEYS.adminSession, s);
    setSession(s);
    setAttempts({ count: 0, lockedUntil: 0 });
    return { success: true };
  }, [account.email, attempts, sessionHours, verifyPassword]);

  const logout = useCallback(() => { removeKey(KEYS.adminSession); setSession(null); }, []);

  const updateAccount = useCallback((data) => {
    const name = String(data.name ?? account.name).trim();
    const email = String(data.email ?? account.email).trim().toLowerCase();
    const phone = String(data.phone ?? account.phone).trim();
    if (name.length < 2) return { success: false, message: "Name must be at least 2 characters." };
    if (!EMAIL_RE.test(email)) return { success: false, message: "Enter a valid email address." };
    if (phone && !PHONE_RE.test(phone)) return { success: false, message: "Enter a valid phone number." };
    setAccount((a) => ({ ...a, name, email, phone }));
    if (email !== account.email) {
      const s = { ...session, email };
      writeJSON(KEYS.adminSession, s);
      setSession(s);
    }
    return { success: true, message: "Profile updated." };
  }, [account, session]);

  const changePassword = useCallback(async (current, next, confirm) => {
    if (!(await verifyPassword(current))) return { success: false, message: "Current password is incorrect." };
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next))
      return { success: false, message: "New password needs 8+ characters with a letter and a number." };
    if (next !== confirm) return { success: false, message: "New passwords do not match." };
    if (next === current) return { success: false, message: "New password must differ from the current one." };
    const hash = await sha256(next);
    setAccount((a) => ({ ...a, passwordHash: hash }));
    return { success: true, message: "Password changed successfully." };
  }, [verifyPassword]);

  const resetAccount = useCallback(() => { removeKey(KEYS.adminAccount); setAccount(DEFAULT_ACCOUNT); }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(session), session, account, login, logout, updateAccount, changePassword, resetAccount,
    usingDefaultPassword: !account.passwordHash,
  }), [session, account, login, logout, updateAccount, changePassword, resetAccount]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>.");
  return ctx;
}

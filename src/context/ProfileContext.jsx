import { createContext, useCallback, useContext, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const EMPTY = { name: "", email: "", phone: "", city: "", bio: "", interests: [] };
const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [stored, setStored] = useLocalStorage("eventify_profile_v1", EMPTY);
  const profile = useMemo(() => ({ ...EMPTY, ...(stored || {}) }), [stored]);
  const updateProfile = useCallback((patch) => setStored((p) => ({ ...EMPTY, ...p, ...patch })), [setStored]);
  const clearProfile = useCallback(() => setStored(EMPTY), [setStored]);
  const value = useMemo(() => ({ profile, updateProfile, clearProfile }), [profile, updateProfile, clearProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}

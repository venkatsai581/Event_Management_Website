import { useCallback, useEffect, useRef, useState } from "react";

const resolve = (v) => (typeof v === "function" ? v() : v);

/** useState that persists to localStorage and syncs across browser tabs. */
export default function useLocalStorage(key, initialValue) {
  const read = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item === null ? resolve(initialValue) : JSON.parse(item);
    } catch {
      return resolve(initialValue);
    }
  };

  const [value, setValue] = useState(read);
  const ref = useRef(value);

  const set = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(ref.current) : next;
      ref.current = resolved;
      setValue(resolved);
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage full or unavailable — keep in-memory state */
      }
    },
    [key]
  );

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      try {
        const next = e.newValue === null ? resolve(initialValue) : JSON.parse(e.newValue);
        ref.current = next;
        setValue(next);
      } catch {
        /* ignore malformed data */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set];
}

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CalendarHeart, Menu, X, Sparkles, UserRound, ShieldCheck } from "lucide-react";
import { useEvents } from "../context/EventContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { stats, settings } = useEvents();
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const link = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label={`${settings.siteName} home`}>
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>{settings.siteName}</span>
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Main navigation">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/events" className={link}>Events</NavLink>
          <NavLink to="/my-events" className={link}>
            My Events {stats.bookings > 0 && <span className="count-pill">{stats.bookings}</span>}
          </NavLink>
          <NavLink to="/profile" className={link}><UserRound size={16} /> Profile</NavLink>
          <NavLink to="/admin" className={link}><ShieldCheck size={16} /> Admin</NavLink>
          <Link to="/events" className="btn btn-primary btn-sm nav-cta"><CalendarHeart size={16} /> Book now</Link>
        </nav>

        <button
          className="icon-btn nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && <button className="nav-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </header>
  );
}

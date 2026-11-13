import { Link } from "react-router-dom";
import { Sparkles, Mail, MapPin } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { CATEGORIES } from "../data/events";

export default function Footer() {
  const { settings } = useEvents();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand brand-light"><span className="brand-mark"><Sparkles size={18} /></span>{settings.siteName}</Link>
          <p className="footer-text">{settings.tagline} Find the best events around you and book your seat in seconds.</p>
          <p className="footer-contact"><Mail size={15} /> {settings.contactEmail}</p>
          <p className="footer-contact"><MapPin size={15} /> Hyderabad, India</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/events">All events</Link>
          <Link to="/my-events">My events</Link>
          <Link to="/profile">My profile</Link>
          <Link to="/admin">Admin</Link>
        </div>
        <div>
          <h4>Categories</h4>
          {CATEGORIES.slice(0, 5).map((c) => <Link key={c} to={`/events?category=${c}`}>{c}</Link>)}
        </div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} {settings.siteName}. Built with React + Vite.</div>
    </footer>
  );
}

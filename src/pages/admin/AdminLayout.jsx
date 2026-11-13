import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarRange, Ticket, UserCog, Settings, LogOut, Globe, Sparkles, AlertTriangle } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useEvents } from "../../context/EventContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import { initials } from "../../utils/format";

const items = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: CalendarRange },
  { to: "/admin/bookings", label: "Bookings", icon: Ticket },
  { to: "/admin/profile", label: "Profile", icon: UserCog },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { account, logout, usingDefaultPassword } = useAdmin();
  const { settings, notify } = useEvents();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const doLogout = () => { logout(); setConfirm(false); notify("Signed out", "info"); navigate("/admin/login", { replace: true }); };

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/admin" className="brand"><span className="brand-mark"><Sparkles size={18} /></span><span>{settings.siteName}<small>Admin</small></span></Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {items.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}><Icon size={18} /><span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" className="admin-link"><Globe size={18} /><span>View site</span></Link>
          <button className="admin-link" onClick={() => setConfirm(true)}><LogOut size={18} /><span>Sign out</span></button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div><small className="muted">Signed in as</small><b>{account.name}</b></div>
          <Link to="/admin/profile" className="avatar" aria-label="Admin profile">{initials(account.name)}</Link>
        </header>
        {usingDefaultPassword && (
          <div className="alert alert-warn admin-alert"><AlertTriangle size={16} /> You're using the default password. <Link to="/admin/profile">Change it now</Link></div>
        )}
        <div className="admin-content"><Outlet /></div>
      </div>

      <ConfirmDialog open={confirm} title="Sign out?" message="You'll need to sign in again to manage events." confirmText="Sign out" onConfirm={doLogout} onCancel={() => setConfirm(false)} />
    </div>
  );
}

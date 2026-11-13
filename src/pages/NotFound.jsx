import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState icon={Compass} title="404 — Page not found" text="The page you're looking for doesn't exist or has moved.">
        <div className="btn-row center"><Link to="/" className="btn btn-primary">Back home</Link><Link to="/events" className="btn btn-ghost">Browse events</Link></div>
      </EmptyState>
    </div>
  );
}

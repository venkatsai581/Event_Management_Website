import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useEvents } from "../context/EventContext";

const icons = { success: CheckCircle2, info: Info, error: AlertTriangle };

export default function Toasts() {
  const { toasts, dismissToast } = useEvents();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} /> <span>{t.message}</span>
            <button className="toast-x" aria-label="Dismiss" onClick={() => dismissToast(t.id)}><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}

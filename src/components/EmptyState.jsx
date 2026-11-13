export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="empty">
      {Icon && <span className="empty-icon"><Icon size={30} /></span>}
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}

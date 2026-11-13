export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <section className="page-header">
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

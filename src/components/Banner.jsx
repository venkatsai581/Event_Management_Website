import { useState } from "react";
import { CATEGORY_META } from "../data/events";

// Event image with a graceful gradient fallback if the photo fails to load.
export default function Banner({ event, className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  const meta = CATEGORY_META[event.category] || { emoji: "🎟️", from: "#5b3df5", to: "#ff6b4a" };

  if (!event.image || failed) {
    return (
      <div
        className={`banner banner-fallback ${className}`}
        style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
        role="img"
        aria-label={`${event.title} banner`}
      >
        <span>{meta.emoji}</span>
      </div>
    );
  }
  return (
    <img
      className={`banner ${className}`}
      src={event.image}
      alt={`${event.title} banner`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}

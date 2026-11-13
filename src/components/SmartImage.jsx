import { useState } from "react";
import { getCategory } from "../utils/categories";

/** Image with a graceful gradient fallback if the URL is empty or fails to load. */
export default function SmartImage({ src, alt = "", category, className = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, hue } = getCategory(category);

  if (!src || failed) {
    return (
      <div
        className={`img-fallback ${className}`}
        role="img"
        aria-label={alt}
        style={{ background: `linear-gradient(135deg, hsl(${hue} 75% 55%), hsl(${(hue + 50) % 360} 80% 62%))` }}
      >
        <Icon size={42} strokeWidth={1.5} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}

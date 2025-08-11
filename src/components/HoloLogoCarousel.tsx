import React, { useMemo } from "react";

type Item = {
  src: string;       // image url
  label: string;     // caption
  href: string;      // link
};

type Props = {
  items: Item[];
  size?: number;              // px width/height of the whole widget
  cardW?: number;             // px card width
  cardH?: number;             // px card height
  radius?: number;            // 3D ring radius (px)
  autoRotateSec?: number;     // seconds per full rotation
  mode?: "ring" | "grid";     // layout
  onItemClick?: (item: Item, index: number, e: React.MouseEvent) => void; // optional click hook
};

const FALLBACK_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stop-color="#00ffa0" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#00e090" stop-opacity="0.35"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <g fill="#00ffa0" opacity="0.9">
        <text x="50%" y="50%" font-family="VT323, monospace" font-size="18" text-anchor="middle">IMAGE</text>
        <text x="50%" y="70%" font-family="VT323, monospace" font-size="14" text-anchor="middle">NOT FOUND</text>
      </g>
    </svg>`
  );

export default function HoloLogoCarousel({
  items,
  size = 560,
  cardW = 180,
  cardH = 110,
  radius = 230,
  autoRotateSec = 28,
  mode = "ring",
  onItemClick,
}: Props) {
  const angles = useMemo(
    () => items.map((_, i) => (i * 360) / items.length),
    [items.length]
  );

  return (
    <div
      className="holo-wrap"
      style={{ width: size, height: size }}
      aria-label="Holographic logo gallery"
    >
      <div
        className={`holo-stage ${mode === "ring" ? "is-3d" : "is-grid"}`}
        style={
          mode === "ring"
            ? ({
                animationDuration: `${autoRotateSec}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {items.map((it, i) => {
          const rotateY = angles[i];
          const transform =
            mode === "ring"
              ? `rotateY(${rotateY}deg) translateZ(${radius}px)`
              : `translate3d(0,0,0)`;

          return (
            <a
              key={i}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="holo-card"
              aria-label={`${it.label} — open link`}
              style={{
                width: cardW,
                height: cardH,
                transform,
              }}
              onClick={(e) => {
                if (onItemClick) {
                  // Let parent decide behavior; prevent default navigation so parent can open modal, etc.
                  e.preventDefault();
                  onItemClick(it, i, e);
                }
              }}
            >
              {/* green scanlines layer */}
              <span className="scanlines" aria-hidden="true" />
              <img
                src={it.src}
                alt={it.label}
                width={cardW}
                height={cardH}
                className="thumb"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== FALLBACK_SVG) {
                    console.warn('[HoloLogoCarousel] Image failed to load:', it.src);
                    img.src = FALLBACK_SVG;
                  }
                }}
              />
              {/* label + pulsing link */}
              <span className="caption">
                <strong>{it.label}</strong>
                <em className="pulse">&nbsp;&gt; LINK</em>
              </span>
            </a>
          );
        })}
      </div>

      <style>{`
        .holo-wrap {
          position: relative;
          margin: 0 auto;
          perspective: 1200px;
          display: grid;
          place-items: center;
          filter: contrast(1.05) brightness(1.03);
        }

        .holo-stage {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          display: grid;
          place-items: center;
        }

        /* Auto-rotate ring */
        .is-3d {
          animation-name: spin;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        /* Grid fallback layout */
        .is-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(${cardW}px, 1fr));
          grid-gap: 18px;
          padding: 18px;
          transform: translateZ(0);
        }

        .holo-card {
          position: absolute;
          transform-style: preserve-3d;
          border: 1px solid rgba(0, 255, 160, 0.35);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 0 12px rgba(0, 255, 160, 0.15),
            inset 0 0 16px rgba(0, 255, 160, 0.12);
          background: rgba(0, 0, 0, 0.35);
          transition: filter 200ms ease, transform 240ms ease,
            box-shadow 240ms ease;
          display: grid;
          place-items: center;
          text-decoration: none;
          will-change: transform, filter;
        }

        /* For grid mode, cards need to be "static" */
        .is-grid .holo-card {
          position: relative;
          transform: none !important;
        }

        .holo-card:focus-visible {
          outline: 2px solid #00ffa0;
          outline-offset: 2px;
        }

        .thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.72;
          filter: grayscale(20%) brightness(0.9) contrast(1.05) saturate(0.9);
          transition: opacity 220ms ease, filter 220ms ease;
          mix-blend-mode: screen;
        }

        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
              to bottom,
              rgba(0, 255, 160, 0.06) 0px,
              rgba(0, 255, 160, 0.06) 2px,
              rgba(0, 0, 0, 0) 3px
            ),
            radial-gradient(
              ellipse at center,
              rgba(0, 255, 160, 0.08),
              rgba(0, 0, 0, 0) 60%
            );
          mix-blend-mode: screen;
          pointer-events: none;
          opacity: 0.85;
          transition: opacity 200ms ease;
        }

        .caption {
          position: absolute;
          left: 10px;
          bottom: 8px;
          right: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: "VT323", ui-monospace, Menlo, monospace;
          color: rgba(0, 255, 160, 0.95);
          text-shadow: 0 0 8px #00ffa0;
          letter-spacing: 0.5px;
          font-size: 14px;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 180ms ease, transform 180ms ease;
          pointer-events: none;
        }

        .pulse {
          color: rgba(0, 255, 160, 0.95);
          animation: pulse 1.2s ease-in-out infinite;
        }

        /* Hover state: brighten, reveal label, pause global spin */
        .holo-card:hover .thumb {
          opacity: 1;
          filter: grayscale(0%) brightness(1.1) contrast(1.1) saturate(1);
        }
        .holo-card:hover .scanlines {
          opacity: 0.55;
        }
        .holo-card:hover .caption {
          opacity: 1;
          transform: translateY(0);
        }
        .is-3d:hover {
          animation-play-state: paused;
        }
        .is-3d:hover .holo-card:hover {
          transform: translateZ(6px) scale(1.03);
          box-shadow: 0 0 24px rgba(0, 255, 160, 0.25),
            inset 0 0 18px rgba(0, 255, 160, 0.18);
        }

        /* Keyframes */
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .is-3d { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

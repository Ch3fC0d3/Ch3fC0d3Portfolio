import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrthographicCamera, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";

type Sector = { label: string; notes?: string[] };

type Props = {
  size?: number;            // CSS size of the canvas wrapper (px)
  sectors: Sector[];        // labels + notes
  outerRadius?: number;     // world units (orthographic)
  ringThickness?: number;   // world units
  spinSeconds?: number;     // slow counter-spin period
  centerLabels?: string[];  // optional words on stationary inner circle (e.g., ingredients)
  centerRadiusRatio?: number; // ratio of inner circle radius relative to innerRadius (0..1)
  centerFontSize?: number;  // px font size for center labels
  // optional centered image overlay
  centerImageSrc?: string;
  centerImageAlt?: string;
  centerImageSizeRatio?: number; // 0..1 relative to size
};

export default function AITastingWheelHUD({
  size = 640,
  sectors,
  outerRadius = 5.6,
  ringThickness = 1.6,
  spinSeconds = 36,
  centerLabels = [],
  centerRadiusRatio = 0.55,
  centerFontSize = 12,
  centerImageSrc,
  centerImageAlt = "center image",
  centerImageSizeRatio = 0.45,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [angleDeg, setAngleDeg] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [ready, setReady] = useState(false);

  const innerRadius = outerRadius - ringThickness;
  const step = 360 / sectors.length;
  const centerR = innerRadius * Math.min(Math.max(centerRadiusRatio, 0.1), 0.95);

  // mouse → angle → sector index (0° at top, clockwise)
  const pickIndexFromAngle = (degFromTopCW: number) =>
    Math.min(
      Math.max(
        Math.floor(((((degFromTopCW - 0) % 360) + 360) % 360) / step),
        0
      ),
      sectors.length - 1
    );

  useEffect(() => {
    // Delay Canvas mounting to avoid context conflicts during HMR or extension injections
    setReady(true);

    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;     // -180..180, 0 at +X
      const degFromTopCW = (deg + 450) % 360;               // rotate so 0 at top, clockwise
      setAngleDeg(degFromTopCW);
      setHoverIndex(pickIndexFromAngle(degFromTopCW));
    };
    const onLeave = () => setHoverIndex(null);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [sectors.length, step]);

  const active = hoverIndex ?? selectedIndex ?? 0;

  return (
    <div
      className="ai-tasting-wheel"
      ref={wrapRef}
      style={{
        width: size,
        height: size,
        position: "relative",
        margin: "0 auto",
        background: "transparent",
      }}
    >
      {/* CRT scanlines / vignette overlay */}
      <div style={scanlineOverlayStyle} />

      {/* HUD readouts */}
      <div style={hudTopLeft}>AI TASTING WHEEL</div>
      <div style={hudTopRight}>θ {angleDeg.toFixed(0)}°</div>
      <div style={hudBottomLeft}>
        SECTORS {sectors.length} • R<sub>o</sub> {Math.round(outerRadius * 48)} • R<sub>i</sub> {Math.round(innerRadius * 48)}
      </div>

      {ready && (
        <Canvas
          key="ai-wheel-canvas"
          id="ai-wheel-canvas"
          orthographic
          gl={{ antialias: true, alpha: true }}
        >
          {/* crisp ortho camera */}
          <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={48} />

          {/* wheel */}
          <Wheel
            sectors={sectors}
            innerR={innerRadius}
            outerR={outerRadius}
            step={step}
            activeIndex={active}
            onSelect={(i) => setSelectedIndex(i)}
            spinSeconds={spinSeconds}
          />

          {/* stationary inner circle guide */}
          {centerLabels.length > 0 && (
            <>
              {/* circle outline */}
              <Circle r={centerR} />
              {/* labels placed evenly around the circle */}
              {centerLabels.map((txt, i) => {
                const a = (i / centerLabels.length) * 360; // degrees
                const rad = THREE.MathUtils.degToRad(a);
                const x = centerR * Math.cos(rad);
                const y = centerR * Math.sin(rad);
                return (
                  <Html key={`center-label-${i}`} position={[x, y, 0]} center style={{ pointerEvents: "none" }}>
                    <div
                      style={{
                        fontFamily: "VT323, ui-monospace, Menlo, monospace",
                        fontSize: centerFontSize,
                        color: "rgba(0,255,160,0.9)",
                        textShadow: "0 0 6px #00ffa0",
                        letterSpacing: 1,
                        transform: `translateY(-2px)`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {txt.toUpperCase()}
                    </div>
                  </Html>
                );
              })}
            </>
          )}

          {/* post FX for CRT depth */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0} luminanceSmoothing={0.5} intensity={0.35} />
            <ChromaticAberration radialModulation={true} offset={[0.0012, 0.0012]} />
            <Vignette eskil={false} offset={0.4} darkness={0.7} />
          </EffectComposer>
        </Canvas>
      )}

      {/* Optional centered image overlay */}
      {centerImageSrc ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: size * Math.min(Math.max(centerImageSizeRatio, 0.1), 0.95),
            height: size * Math.min(Math.max(centerImageSizeRatio, 0.1), 0.95),
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 0 18px rgba(0,255,160,0.25), inset 0 0 12px rgba(0,255,160,0.18)",
            background: "rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
          aria-label="Wheel center image"
        >
          <img
            src={centerImageSrc}
            alt={centerImageAlt}
            style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.9 }}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.opacity = "0.6";
            }}
          />
        </div>
      ) : null}

      {/* Notes panel (fixed for readability) */}
      <div style={notesPanel}>
        <div style={notesTitle}>{sectors[active]?.label ?? "—"}</div>
        <div style={notesList}>
          {(sectors[active]?.notes ?? []).map((n, i) => (
            <div key={i} style={noteItem}>• {n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Wheel group ---------- */

function Wheel({
  sectors,
  innerR,
  outerR,
  step,
  activeIndex,
  onSelect,
  spinSeconds,
}: {
  sectors: Sector[];
  innerR: number;
  outerR: number;
  step: number;
  activeIndex: number;
  onSelect: (i: number) => void;
  spinSeconds: number;
}) {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z -= (Math.PI * 2 * dt) / spinSeconds; // subtle counter-spin
  });

  // grid circles
  const circles = [innerR * 0.6, innerR * 0.85, innerR + (outerR - innerR) * 0.5, outerR];

  return (
    <group ref={group}>
      {/* grid rings */}
      {circles.map((r, i) => (
        <Circle key={i} r={r} />
      ))}

      {/* spokes */}
      {sectors.map((_, i) => {
        const a = THREE.MathUtils.degToRad(-90 + i * step);
        const p1 = new THREE.Vector3(innerR * Math.cos(a), innerR * Math.sin(a), 0);
        const p2 = new THREE.Vector3(outerR * Math.cos(a), outerR * Math.sin(a), 0);
        return <Line key={`spoke-${i}`} points={[p1, p2]} color={dimNeon} lineWidth={1} />;
      })}

      {/* donut sectors */}
      {sectors.map((s, i) => (
        <SectorMesh
          key={i}
          index={i}
          label={s.label}
          innerR={innerR}
          outerR={outerR}
          startDeg={-90 + i * step}
          endDeg={-90 + (i + 1) * step}
          active={i === activeIndex}
          onClick={() => onSelect(i)}
        />
      ))}

      {/* crosshair */}
      <Line points={[[-0.16, 0, 0], [0.16, 0, 0]]} color={neon} lineWidth={1.5} />
      <Line points={[[0, -0.16, 0], [0, 0.16, 0]]} color={neon} lineWidth={1.5} />
    </group>
  );
}

function Circle({ r }: { r: number }) {
  const pts = useMemo(() => {
    const a: THREE.Vector3[] = [];
    const seg = 128;
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      a.push(new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), 0));
    }
    return a;
  }, [r]);
  return <Line points={pts} color={dimNeon} lineWidth={1} />;
}

function SectorMesh({
  index,
  label,
  innerR,
  outerR,
  startDeg,
  endDeg,
  active,
  onClick,
}: {
  index: number;
  label: string;
  innerR: number;
  outerR: number;
  startDeg: number;
  endDeg: number;
  active: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const htmlRef = useRef<HTMLDivElement>(null!);

  // build donut sector shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const a0 = THREE.MathUtils.degToRad(startDeg);
    const a1 = THREE.MathUtils.degToRad(endDeg);
    const arc = (ctx: THREE.Path, r: number, from: number, to: number, cw: boolean) =>
      ctx.absarc(0, 0, r, from, to, !cw);
    s.moveTo(outerR * Math.cos(a0), outerR * Math.sin(a0));
    arc(s, outerR, a0, a1, true);
    const path = new THREE.Path();
    arc(path, innerR, a1, a0, false);
    s.holes.push(path);
    return s;
  }, [innerR, outerR, startDeg, endDeg]);

  const geom = useMemo(() => new THREE.ShapeGeometry(shape, 64), [shape]);
  useEffect(() => () => geom.dispose(), [geom]);

  // hover pulse
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const scale = active ? 1 + 0.03 * Math.sin(t * 5.0) : 1;
    meshRef.current.scale.setScalar(scale);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.color.set(neon);
    (mat as any).opacity = active ? 1 : 0.75;
  });

  // sector label (HTML at arc mid-point)
  const mid = (startDeg + endDeg) / 2;
  const rMid = innerR + (outerR - innerR) * 0.5;
  const px = rMid * Math.cos(THREE.MathUtils.degToRad(mid));
  const py = rMid * Math.sin(THREE.MathUtils.degToRad(mid));

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geom}
        onClick={onClick}
        onPointerOver={(e) => (e.stopPropagation(), ((meshRef.current.material as any).opacity = 1))}
      >
        <meshBasicMaterial color={neon} transparent opacity={0.9} />
      </mesh>
      <Html position={[px, py, 0]} center style={{ pointerEvents: "none" }}>
        <div
          style={{
            fontFamily: "VT323, ui-monospace, Menlo, monospace",
            fontSize: active ? 18 : 14,
            color: active ? neon : "rgba(0,255,160,0.75)",
            textShadow: "0 0 8px #00ffa0",
            letterSpacing: 1,
          }}
          ref={htmlRef}
        >
          {label.toUpperCase()}
        </div>
      </Html>
    </group>
  );
}

/* ---------- Styles ---------- */

// Three.js ignores alpha in Color, so use solid hex for 3D colors.
// Opacity is controlled via materials (e.g., meshBasicMaterial transparent/opacity).
const neon = "#00ffa0";
const dimNeon = "#00a070"; // darker variant to simulate dim without alpha

const scanlineOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,255,160,0.06) 3px), radial-gradient(ellipse at center, rgba(0,255,160,0.08), rgba(0,0,0,0) 60%)",
  mixBlendMode: "screen",
  opacity: 0.85,
};

const hudTopLeft: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: 10,
  color: neon,
  fontFamily: "VT323, ui-monospace, Menlo, monospace",
  fontSize: 14,
  letterSpacing: 1,
  textShadow: "0 0 6px #00ffa0",
  pointerEvents: "none",
};

const hudTopRight: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 10,
  color: neon,
  fontFamily: "VT323, ui-monospace, Menlo, monospace",
  fontSize: 14,
  letterSpacing: 1,
  textShadow: "0 0 6px #00ffa0",
  pointerEvents: "none",
};

const hudBottomLeft: React.CSSProperties = { 
  position: "absolute",
  bottom: 8,
  left: 10,
  color: "rgba(0,255,160,0.85)",
  fontFamily: "VT323, ui-monospace, Menlo, monospace",
  fontSize: 12,
  letterSpacing: 1,
  pointerEvents: "none",
};

const notesPanel: React.CSSProperties = {
  position: "absolute",
  right: 14,
  bottom: 14,
  width: 220,
  border: "1px solid rgba(0,255,160,0.35)",
  boxShadow: "0 0 12px rgba(0,255,160,0.25) inset",
  padding: "10px 12px",
  color: neon,
  fontFamily: "VT323, ui-monospace, Menlo, monospace",
  background: "linear-gradient(transparent 50%, rgba(0,255,160,0.06) 51%)",
  backgroundSize: "100% 4px",
};

const notesTitle: React.CSSProperties = {
  fontSize: 18,
  marginBottom: 6,
  textShadow: "0 0 8px #00ffa0",
};

const notesList: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "18px",
  color: "rgba(0,255,160,0.9)",
};

const noteItem: React.CSSProperties = { marginBottom: 2 };

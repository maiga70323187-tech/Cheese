import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { oscillate } from "../motion";
import { seededSequence, stringToSeed } from "../deterministic-random";

const PARTICLE_COUNT = 22;

function buildBaseLayer(theme: BrandTheme): React.CSSProperties {
  const { background } = theme;
  const [c1, c2, c3] = background.colors;
  const first = c1 ?? theme.colors.background;
  const second = c2 ?? first;
  const third = c3 ?? second;

  switch (background.type) {
    case "solid":
      return { background: first };
    case "radial":
    case "studio":
      // `farthest-corner` (not a fixed % size) guarantees the last color
      // stop always lands exactly on the box's corners, so there is never
      // a hard seam where the gradient runs out before reaching an edge.
      return {
        background: `radial-gradient(circle farthest-corner at 50% 38%, ${second} 0%, ${first} 55%, ${third} 100%)`,
      };
    case "gradient":
      return { background: `linear-gradient(160deg, ${first} 0%, ${second} 55%, ${third} 100%)` };
    case "custom":
    default:
      return { background: `linear-gradient(180deg, ${first}, ${third})` };
  }
}

/**
 * The one place where "premium background that never disappears into
 * black" is implemented: base gradient + subject glow + vignette + grain +
 * discreet particles, every value sourced from `theme.background`.
 */
export const PremiumBackground: React.FC<{ theme: BrandTheme; children?: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = stringToSeed(theme.id);
  const particlePositions = seededSequence(seed, PARTICLE_COUNT * 3);

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...buildBaseLayer(theme) }}>
      {theme.background.glow && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(closest-side, ${theme.colors.primary}55 0%, transparent 70%)`,
            opacity: oscillate(frame, 150, 0.55, 0.85),
            filter: "blur(2px)",
          }}
        />
      )}

      {theme.background.particles && (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, opacity: 0.5 }}
        >
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const base = i * 3;
            const rx = particlePositions[base] ?? 0.5;
            const ry = particlePositions[base + 1] ?? 0.5;
            const speed = particlePositions[base + 2] ?? 0.5;
            const x = rx * width;
            const y = ry * height + oscillate(frame + i * 37, 220 + speed * 120, -18, 18);
            const radius = 1.2 + speed * 2.2;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={radius}
                fill={theme.colors.primary}
                opacity={0.15 + speed * 0.35}
              />
            );
          })}
        </svg>
      )}

      {(theme.background.grain ?? 0) > 0 && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <filter id={`grain-${theme.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={seed % 100} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter={`url(#grain-${theme.id})`}
            opacity={(theme.background.grain ?? 0) * 0.5}
          />
        </svg>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${Math.round(theme.background.vignette * 45)}vmin rgba(0,0,0,${theme.background.vignette})`,
        }}
      />

      {children}
    </AbsoluteFill>
  );
};

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { DashboardUI } from "../dashboard/DashboardUI";
import type { DashboardVariant } from "../dashboard/dashboard-data";
import { oscillate, useEntrance } from "../motion";

export interface Phone25DProps {
  theme: BrandTheme;
  dashboardVariant: DashboardVariant;
  /** Frame (relative to this scene) at which the phone starts its entrance. */
  entranceDelay?: number;
}

/**
 * Procedural phone chassis — no external asset required. Every plane
 * (backdrop blobs, phone body, glass, screen content) animates on its own
 * axis so the parallax reads as real depth rather than one flat card:
 *  - decor drifts slowest (furthest plane)
 *  - the phone turns slowly on its own turntable + a shared "camera" tilt
 *  - the screen content (DashboardUI) runs its own entrance, independent
 *    of the phone's rotation
 *  - a glass highlight sweeps across the screen on its own cycle
 *  - a light runs along the chassis edge on yet another cycle
 *
 * To swap in a real 3D/GLB phone later, replace only this component (see
 * `PhoneShowcase.tsx`) or route `render: "3d"` to `PhoneShowcase3D`
 * (Checkpoint C) — the surrounding scene, theme and dashboard content stay
 * identical either way.
 */
export const Phone25D: React.FC<Phone25DProps> = ({ theme, dashboardVariant, entranceDelay = 0 }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const entrance = useEntrance(theme, entranceDelay);

  const phoneHeight = height * 0.6;
  const phoneWidth = phoneHeight * (9 / 19.5);
  const bezel = phoneWidth * 0.045;

  // Independent, deterministic cycles per layer/effect.
  const turntable = oscillate(frame, 260, -7, 7);
  const cameraTiltX = oscillate(frame, 340, -3, 3);
  const cameraTiltY = oscillate(frame + 60, 300, -4, 4);
  const breathe = oscillate(frame, 200, 0.985, 1.015);
  const glassSweep = oscillate(frame, 130, -60, 160);
  const chassisLightPos = oscillate(frame, 180, 0, 100);
  const shadowSquash = oscillate(frame, 260, 0.85, 1);

  return (
    <div
      style={{
        position: "relative",
        width: phoneHeight,
        height: phoneHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1400,
        opacity: entrance.opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          width: phoneWidth,
          height: phoneHeight,
          transformStyle: "preserve-3d",
          transform: `${entrance.transform} rotateX(${cameraTiltX}deg) rotateY(${cameraTiltY + turntable}deg) scale(${breathe})`,
        }}
      >
        {/* Ambient contact shadow on the "ground" — perspective-squashed as the phone rotates. */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -phoneHeight * 0.06,
            width: phoneWidth * 1.5,
            height: phoneWidth * 0.4,
            transform: `translateX(-50%) scaleY(${shadowSquash})`,
            background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 75%)",
            filter: "blur(6px)",
          }}
        />

        {/* Chassis: rounded body with a light that sweeps along its border. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: phoneWidth * 0.18,
            background: `linear-gradient(160deg, ${theme.colors.surface}, ${theme.colors.background})`,
            boxShadow: theme.shadows.elevated,
            padding: bezel,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: phoneWidth * 0.18,
              padding: 1.5,
              background: `linear-gradient(${chassisLightPos * 3.6}deg, transparent, ${theme.colors.primary}, transparent 60%)`,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            }}
          />

          {/* Screen. */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: phoneWidth * 0.12,
              overflow: "hidden",
              background: theme.colors.background,
              fontSize: phoneWidth * 0.075,
            }}
          >
            <DashboardUI theme={theme} variant={dashboardVariant} startFrame={entranceDelay + 6} maxMetrics={2} />

            {/* Animated glass reflection sweeping over the screen content. */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${glassSweep}%`,
                width: "45%",
                background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.16) 45%, transparent 90%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Camera notch. */}
        <div
          style={{
            position: "absolute",
            top: bezel * 0.5,
            left: "50%",
            transform: "translateX(-50%)",
            width: phoneWidth * 0.18,
            height: phoneWidth * 0.045,
            borderRadius: phoneWidth * 0.03,
            background: theme.colors.background,
          }}
        />
      </div>
    </div>
  );
};

import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandTheme } from "../brand/schema";

export interface EntranceStyle {
  opacity: number;
  transform: string;
}

/**
 * Translates the theme's abstract `motion.entrance` into a concrete,
 * frame-only (deterministic) opacity/transform pair. Every scene calls this
 * instead of hand-rolling its own interpolate() calls, so a theme's motion
 * feel is consistent across every composition that uses it.
 */
export function useEntrance(theme: BrandTheme, delayFrames = 0): EntranceStyle {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delayFrames);
  const { entrance, durationFrames, spring: springConfig } = theme.motion;

  if (entrance === "spring") {
    const progress = spring({
      frame: localFrame,
      fps,
      config: springConfig ?? { damping: 14, mass: 0.8, stiffness: 160 },
      durationInFrames: durationFrames,
    });
    return {
      opacity: interpolate(progress, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `scale(${interpolate(progress, [0, 1], [0.7, 1])}) translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
    };
  }

  if (entrance === "kinetic") {
    // Punchy slide + rotation with a spring overshoot/settle — the "card
    // flips into place" energy from kinetic-typography reference footage
    // (see ARCHITECTURE.md), as opposed to "spring"'s straight scale+lift.
    const progress = spring({
      frame: localFrame,
      fps,
      config: springConfig ?? { damping: 12, mass: 0.75, stiffness: 210 },
      durationInFrames: durationFrames,
    });
    const translate = interpolate(progress, [0, 1], [70, 0]);
    const rotate = interpolate(progress, [0, 1], [-10, 0]);
    const scale = interpolate(progress, [0, 1], [0.88, 1]);
    return {
      opacity: interpolate(progress, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translateX(${translate}px) rotate(${rotate}deg) scale(${scale})`,
    };
  }

  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  switch (entrance) {
    case "fade":
      return { opacity: progress, transform: "none" };
    case "slide":
      return { opacity: progress, transform: `translateY(${interpolate(progress, [0, 1], [48, 0])}px)` };
    case "scale":
      return { opacity: progress, transform: `scale(${interpolate(progress, [0, 1], [0.82, 1])})` };
    case "reveal":
    default:
      return { opacity: progress, transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)` };
  }
}

/** A slow, deterministic, infinitely-looping oscillation — used for glow pulses and ambient drift. */
export function oscillate(frame: number, periodInFrames: number, min: number, max: number): number {
  const phase = (frame / periodInFrames) * Math.PI * 2;
  return interpolate(Math.sin(phase), [-1, 1], [min, max]);
}

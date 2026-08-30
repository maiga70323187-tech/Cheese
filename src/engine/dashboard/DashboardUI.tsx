import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import type { DashboardMetric, DashboardVariant } from "./dashboard-data";
import { resolveDashboardPreset } from "./dashboard-data";

export interface DashboardUIProps {
  theme: BrandTheme;
  variant: DashboardVariant;
  title?: string;
  metrics?: DashboardMetric[];
  /** Frame at which this dashboard's own entrance animation starts (relative to its own Sequence). */
  startFrame?: number;
  /** Cap how many metric tiles render — a phone screen is much narrower than a full-screen dashboard, so 3 tiles truncate unreadably there; the phone scenes pass 2. */
  maxMetrics?: number;
}

export interface DashboardUIPresentationProps extends Omit<DashboardUIProps, "startFrame"> {
  /** Local frame (already offset), passed in rather than read via `useCurrentFrame()`. */
  frame: number;
}

/**
 * Pure rendering half of the dashboard — takes `frame` as a prop instead of
 * calling `useCurrentFrame()` itself. `PhoneShowcase3D` renders this
 * directly (with a frame value read in the R3F tree, where the hook does
 * work) because `useCurrentFrame()` throws when called from inside drei's
 * `<Html>`: `<Html>` portals its children out of the R3F fiber tree that
 * `@remotion/three` bridges Remotion's context into, back into a plain
 * `ReactDOM.createPortal` tree that never receives that context. See
 * TROUBLESHOOTING.md.
 */
export const DashboardUIPresentation: React.FC<DashboardUIPresentationProps> = ({
  theme,
  variant,
  title,
  metrics,
  maxMetrics,
  frame: local,
}) => {
  const preset = resolveDashboardPreset(variant, { title, metrics });
  const visibleMetrics = maxMetrics ? preset.metrics.slice(0, maxMetrics) : preset.metrics;
  const cardIn = interpolate(local, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.surface,
        borderRadius: theme.radius.medium,
        boxShadow: theme.shadows.elevated,
        padding: "1em",
        display: "flex",
        flexDirection: "column",
        gap: "0.75em",
        opacity: cardIn,
        transform: `translateY(${interpolate(cardIn, [0, 1], [0.6, 0])}em)`,
        fontFamily: theme.typography.body,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: theme.typography.heading,
          fontSize: "1.15em",
          fontWeight: 700,
          color: theme.colors.text,
        }}
      >
        {preset.title}
      </div>

      <div style={{ display: "flex", gap: "0.6em" }}>
        {visibleMetrics.map((metric, i) => {
          const tileIn = interpolate(local, [8 + i * 6, 8 + i * 6 + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={metric.label}
              style={{
                flex: "1 1 0",
                minWidth: 0,
                background: theme.colors.backgroundSecondary ?? theme.colors.background,
                borderRadius: theme.radius.small,
                padding: "0.5em",
                opacity: tileIn,
                transform: `scale(${interpolate(tileIn, [0, 1], [0.85, 1])})`,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: "0.78em",
                  color: theme.colors.textMuted ?? theme.colors.text,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: "1.05em",
                  fontWeight: 700,
                  color: theme.colors.primary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          gap: "0.4em",
          padding: "0 0.1em",
        }}
      >
        {preset.bars.map((height, i) => {
          const barIn = interpolate(local, [24 + i * 4, 24 + i * 4 + 16], [0, height], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${barIn * 100}%`,
                background: `linear-gradient(180deg, ${theme.colors.primary}, ${theme.colors.secondary ?? theme.colors.primary})`,
                borderRadius: theme.radius.small * 0.5,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Hook-driven wrapper for normal (plain DOM) usage — every 2D scene uses
 * this. Reads the frame itself, then delegates to the pure presentation
 * component above.
 */
export const DashboardUI: React.FC<DashboardUIProps> = ({ startFrame = 0, ...rest }) => {
  const frame = useCurrentFrame();
  return <DashboardUIPresentation {...rest} frame={Math.max(0, frame - startFrame)} />;
};

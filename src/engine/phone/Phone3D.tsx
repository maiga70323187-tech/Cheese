import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import type { BrandTheme } from "../../brand/schema";
import { resolveDashboardPreset } from "../dashboard/dashboard-data";
import type { DashboardVariant } from "../dashboard/dashboard-data";
import { oscillate } from "../motion";

export interface Phone3DSceneProps {
  theme: BrandTheme;
  dashboardVariant: DashboardVariant;
}

const PHONE_WIDTH = 1.4;
const PHONE_HEIGHT = PHONE_WIDTH * (19.5 / 9);
const PHONE_DEPTH = 0.16;
const BEZEL = 0.06;
const GLASS_THICKNESS = 0.05;

// RoundedBox's bevel radius must stay well under half of the box's
// smallest dimension, or the bevel geometry balloons and degenerates
// (this produced a room-filling, wildly zoomed-looking mesh before it was
// caught by a real render — see TROUBLESHOOTING.md).
const BODY_RADIUS = Math.min(0.14, PHONE_DEPTH * 0.4);
const GLASS_RADIUS = Math.min(0.08, GLASS_THICKNESS * 0.4);

interface ScreenContentProps {
  theme: BrandTheme;
  variant: DashboardVariant;
  frame: number;
  width: number;
  height: number;
  z: number;
}

/**
 * The dashboard, reimplemented as native Three.js geometry instead of
 * drei's `<Html>`.
 *
 * `<Html transform>` was tried first (it would have let the screen reuse
 * the exact same `DashboardUI` DOM component as the 2D/2.5D scenes) but it
 * never rendered anything under `@remotion/three`'s `<ThreeCanvas>`: `Html`
 * portals its children out of the R3F fiber tree via `ReactDOM.createPortal`
 * and positions them on every `useFrame` tick — under Remotion's
 * frameloop="never" + single manual `advance()` per frame, that positioning
 * pass never ran, so the portaled DOM node stayed unpositioned/invisible
 * (confirmed with a plain lime debug `<div>` — nothing appeared, not a
 * styling issue). See TROUBLESHOOTING.md.
 *
 * Numeric values are intentionally not rendered here (no on-screen text) to
 * avoid a second real risk: drei/troika's `<Text>` fetches its default font
 * file from a CDN, which this project treats as off-limits (see
 * ARCHITECTURE.md's "no HDRI fetch" lighting decision, same reasoning). The
 * fully readable, numbered dashboard already exists in the 2D
 * (`DashboardShowcase`) and 2.5D (`PhoneShowcase`) scenes; this 3D screen
 * shows the same header/tiles/bar-chart shape as real geometry — lit,
 * shadowed, catching the glass reflection — which is a more honest use of
 * "real 3D" than a flat DOM screenshot would be anyway.
 */
const ScreenContent: React.FC<ScreenContentProps> = ({ theme, variant, frame, width, height, z }) => {
  const preset = resolveDashboardPreset(variant);
  const pad = width * 0.08;
  const headerHeight = height * 0.1;
  const tileGap = width * 0.05;
  const tileWidth = (width - pad * 2 - tileGap) / 2;
  const tileHeight = height * 0.16;
  const chartTop = height * 0.32;
  const chartHeight = height * 0.42;
  const barGap = width * 0.02;
  const barWidth = (width - pad * 2 - barGap * (preset.bars.length - 1)) / preset.bars.length;

  // Entrance is scale-only (0 -> 1), never opacity: every `transparent`
  // mesh material tried here rendered fully invisible in this pipeline
  // (confirmed by swapping one for an identical opaque material — same
  // mesh, same position, and it appeared). Root cause not fully pinned
  // down (not `gl.premultipliedAlpha`, ruled out below); scale-only
  // entrance sidesteps it entirely. See TROUBLESHOOTING.md.
  const cardIn = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <group position={[0, 0, z]}>
      {/* Header bar standing in for the dashboard title. */}
      <group
        position={[-width / 2 + pad + headerHeight * 0.9, height / 2 - pad - headerHeight / 2, 0.002]}
        scale={interpolate(cardIn, [0, 1], [0.6, 1])}
      >
        <mesh>
          <planeGeometry args={[headerHeight * 1.8, headerHeight * 0.42]} />
          <meshStandardMaterial color={theme.colors.text} emissive={theme.colors.text} emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* Metric tiles. */}
      {[0, 1].map((i) => {
        const tileIn = interpolate(frame, [8 + i * 6, 8 + i * 6 + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = -width / 2 + pad + tileWidth / 2 + i * (tileWidth + tileGap);
        const y = height / 2 - pad - headerHeight - tileHeight / 2 - height * 0.02;
        return (
          <group key={i} position={[x, y, 0]} scale={interpolate(tileIn, [0, 1], [0.6, 1])}>
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={[tileWidth, tileHeight]} />
              <meshStandardMaterial color={theme.colors.backgroundSecondary ?? theme.colors.background} />
            </mesh>
            <mesh position={[-tileWidth * 0.28, -tileHeight * 0.15, 0.003]}>
              <planeGeometry args={[tileWidth * 0.4, tileHeight * 0.22]} />
              <meshStandardMaterial color={theme.colors.primary} emissive={theme.colors.primary} emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Bar chart — real extruded geometry, so it actually catches the scene's lights and casts a shadow onto the screen backing. */}
      {preset.bars.map((barHeight, i) => {
        const barIn = interpolate(frame, [24 + i * 4, 24 + i * 4 + 16], [0, barHeight], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const h = Math.max(0.0001, barIn * chartHeight);
        const x = -width / 2 + pad + barWidth / 2 + i * (barWidth + barGap);
        const y = height / 2 - pad - chartTop - chartHeight + h / 2;
        return (
          <mesh key={i} position={[x, y, 0.01]} castShadow receiveShadow>
            <boxGeometry args={[barWidth, h, 0.02]} />
            <meshStandardMaterial
              color={theme.colors.primary}
              emissive={theme.colors.primary}
              emissiveIntensity={0.15}
              metalness={0.1}
              roughness={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Every value here is a pure function of `useCurrentFrame()` — no
 * `useFrame`/RAF loop, no internal React state — so the exact same frame
 * number always produces the exact same scene, which is what makes this
 * safe to render frame-by-frame with `@remotion/three`'s `<ThreeCanvas>`.
 *
 * The phone body is procedural (RoundedBox + planes), not a GLB — swap it
 * for an imported model by replacing the `<group>` below with a `<primitive
 * object={gltf.scene} />` from `useGLTF`; keep `ScreenContent` positioned
 * at the model's own screen-plane local coordinates. See
 * TROUBLESHOOTING.md for the exact steps.
 */
export const Phone3DScene: React.FC<Phone3DSceneProps> = ({ theme, dashboardVariant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const turntable = frame * 0.006 + oscillate(frame, 300, -0.05, 0.05);
  const bobbing = oscillate(frame, 220, -0.04, 0.04);
  const cameraDrift = oscillate(frame, 380, -0.35, 0.35);
  const cameraHeight = oscillate(frame + 40, 420, -0.12, 0.12);
  const rimIntensity = oscillate(frame, 150, 0.6, 1.4);

  const screenInnerWidth = PHONE_WIDTH - BEZEL * 2;
  const screenInnerHeight = PHONE_HEIGHT - BEZEL * 2;

  return (
    <>
      {/*
        `manual` + an explicit `aspect` (from Remotion's own useVideoConfig,
        known synchronously) instead of drei's default auto-aspect-from-
        viewport: the auto path reads R3F's `size` state, which is set by
        ThreeCanvas's own resize effect — an ordering race was observed
        where relying on it produced a wildly wrong first frame. Passing
        aspect explicitly removes the race.
      */}
      <PerspectiveCamera
        makeDefault
        manual
        aspect={width / height}
        fov={28}
        position={[cameraDrift, 0.1 + cameraHeight, 9.5]}
      />

      {/* Deterministic, offline studio lighting — no HDRI fetch. */}
      <ambientLight intensity={0.35} />
      <hemisphereLight args={[theme.colors.text, theme.colors.background, 0.25]} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <pointLight position={[-1.5, -0.5, 2.5]} intensity={rimIntensity} color={theme.colors.primary} distance={6} />

      <group rotation={[0.04, turntable, 0]} position={[0, bobbing, 0]}>
        {/* Body — clearcoat gives the glossy "toy plastic" look from the
            reference 3D icon renders (single object, soft rounded
            highlights) rather than the flatter meshStandardMaterial look
            this had before; RoundedBox smoothness bumped so those
            highlights land on clean, evenly-subdivided geometry. */}
        <RoundedBox args={[PHONE_WIDTH, PHONE_HEIGHT, PHONE_DEPTH]} radius={BODY_RADIUS} smoothness={8} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={theme.colors.surface}
            metalness={0.5}
            roughness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.12}
            reflectivity={0.5}
          />
        </RoundedBox>

        {/* Screen backing. */}
        <mesh position={[0, 0, PHONE_DEPTH / 2 + 0.005]} receiveShadow>
          <planeGeometry args={[screenInnerWidth, screenInnerHeight]} />
          <meshStandardMaterial
            color={theme.colors.background}
            emissive={theme.colors.background}
            emissiveIntensity={0.4}
          />
        </mesh>

        <ScreenContent
          theme={theme}
          variant={dashboardVariant}
          frame={frame}
          width={screenInnerWidth}
          height={screenInnerHeight}
          z={PHONE_DEPTH / 2 + 0.008}
        />

        {/* Semi-transparent glass cover — realistic transmission material for the reflection. */}
        <RoundedBox
          args={[screenInnerWidth * 1.01, screenInnerHeight * 1.01, GLASS_THICKNESS]}
          radius={GLASS_RADIUS}
          smoothness={6}
          position={[0, 0, PHONE_DEPTH / 2 + 0.02 + GLASS_THICKNESS / 2]}
        >
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.92}
            roughness={0.04}
            thickness={0.05}
            ior={1.5}
            reflectivity={0.4}
            transparent
          />
        </RoundedBox>

        {/* Camera notch. */}
        <mesh position={[0, PHONE_HEIGHT / 2 - BEZEL * 0.8, PHONE_DEPTH / 2 + 0.01]}>
          <circleGeometry args={[0.035, 24]} />
          <meshStandardMaterial color={theme.colors.background} />
        </mesh>
      </group>

      {/* Ground plane to catch a soft contact shadow. */}
      <mesh position={[0, -PHONE_HEIGHT / 2 - 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
    </>
  );
};

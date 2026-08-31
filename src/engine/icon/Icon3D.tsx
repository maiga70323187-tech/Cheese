import React from "react";
import { useCurrentFrame } from "remotion";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import type { BrandTheme } from "../../brand/schema";
import { oscillate } from "../motion";

export type IconShape = "ring" | "diamond" | "facet";

export interface Icon3DSceneProps {
  theme: BrandTheme;
  shape: IconShape;
  aspect: number;
}

const BACKDROP_SIZE = 2.2;
const BACKDROP_DEPTH = 0.22;
const BACKDROP_RADIUS = Math.min(0.45, BACKDROP_DEPTH * 0.4);

/** The abstract mark itself — a standard Three.js primitive per shape, no custom geometry risk. */
const Mark: React.FC<{ shape: IconShape }> = ({ shape }) => {
  switch (shape) {
    case "ring":
      return <torusGeometry args={[0.62, 0.22, 32, 64]} />;
    case "diamond":
      return <octahedronGeometry args={[0.85, 0]} />;
    case "facet":
    default:
      return <icosahedronGeometry args={[0.78, 0]} />;
  }
};

/**
 * Single-object 3D "product icon" scene — inspired by the glossy app-icon
 * renders in the reference corpus (one mark, centered, on a rounded-square
 * backdrop, soft studio highlights). Shares its lighting/camera/material
 * recipe with `Phone3DScene` (see TROUBLESHOOTING.md for why: manual
 * camera aspect, no HDRI/Text, clearcoat for the glossy look) but has no
 * screen content to manage, so it's the simplest scene to swap in a real
 * brand-logo GLB later — see SCENES.md.
 */
export const Icon3DScene: React.FC<Icon3DSceneProps> = ({ theme, shape, aspect }) => {
  const frame = useCurrentFrame();

  const spin = frame * 0.012 + oscillate(frame, 260, -0.06, 0.06);
  const tilt = 0.32 + oscillate(frame, 340, -0.05, 0.05);
  const bobbing = oscillate(frame, 200, -0.05, 0.05);
  const cameraDrift = oscillate(frame, 360, -0.3, 0.3);
  const rimIntensity = oscillate(frame, 140, 0.7, 1.5);
  const scaleIn = Math.min(1, frame / 18);

  return (
    <>
      <PerspectiveCamera makeDefault manual aspect={aspect} fov={30} position={[cameraDrift, 0.1, 6.2]} />

      <ambientLight intensity={0.35} />
      <hemisphereLight args={[theme.colors.text, theme.colors.background, 0.25]} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <pointLight position={[-1.4, -0.4, 2.6]} intensity={rimIntensity} color={theme.colors.primary} distance={6} />

      {/* Backdrop card, same clearcoat "toy plastic" recipe as the phone body. */}
      <RoundedBox
        args={[BACKDROP_SIZE, BACKDROP_SIZE, BACKDROP_DEPTH]}
        radius={BACKDROP_RADIUS}
        smoothness={8}
        position={[0, 0, -0.55]}
        receiveShadow
      >
        <meshPhysicalMaterial
          color={theme.colors.surface}
          metalness={0.4}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>

      {/* The mark, floating in front, slow turntable + gentle bob. */}
      <group rotation={[tilt, spin, 0]} position={[0, bobbing, 0]} scale={scaleIn}>
        <mesh castShadow>
          <Mark shape={shape} />
          <meshPhysicalMaterial
            color={theme.colors.primary}
            metalness={0.3}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={theme.colors.primary}
            emissiveIntensity={0.08}
          />
        </mesh>
      </group>
    </>
  );
};

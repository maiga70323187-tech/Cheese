import React from "react";
import { VideoComposition, type VideoCompositionProps } from "./VideoComposition";

/** 1080x1920 — format `vertical`. */
export const VideoVertical: React.FC<VideoCompositionProps> = ({ scenario }) => (
  <VideoComposition scenario={{ ...scenario, format: "vertical" }} />
);

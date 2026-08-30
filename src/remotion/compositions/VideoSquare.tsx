import React from "react";
import { VideoComposition, type VideoCompositionProps } from "./VideoComposition";

/** 1080x1080 — format `square`. */
export const VideoSquare: React.FC<VideoCompositionProps> = ({ scenario }) => (
  <VideoComposition scenario={{ ...scenario, format: "square" }} />
);

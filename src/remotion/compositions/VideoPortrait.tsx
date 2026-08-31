import React from "react";
import { VideoComposition, type VideoCompositionProps } from "./VideoComposition";

/** 1080x1350 — format `portrait` (4:5, flux LinkedIn). */
export const VideoPortrait: React.FC<VideoCompositionProps> = ({ scenario }) => (
  <VideoComposition scenario={{ ...scenario, format: "portrait" }} />
);

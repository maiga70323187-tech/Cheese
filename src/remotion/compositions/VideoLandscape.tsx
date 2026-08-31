import React from "react";
import { VideoComposition, type VideoCompositionProps } from "./VideoComposition";

/** 1920x1080 — format `landscape`. */
export const VideoLandscape: React.FC<VideoCompositionProps> = ({ scenario }) => (
  <VideoComposition scenario={{ ...scenario, format: "landscape" }} />
);

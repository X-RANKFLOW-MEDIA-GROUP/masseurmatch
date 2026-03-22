import type { MouseEvent } from "react";

const MAX_ROTATION = 5;
const MAX_MEDIA_SHIFT = 10;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function handleProfileCardTilt(event: MouseEvent<HTMLElement>) {
  if (prefersReducedMotion()) {
    return;
  }

  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const pointerX = (event.clientX - rect.left) / rect.width;
  const pointerY = (event.clientY - rect.top) / rect.height;
  const rotateY = clamp((pointerX - 0.5) * MAX_ROTATION * 2, -MAX_ROTATION, MAX_ROTATION);
  const rotateX = clamp((0.5 - pointerY) * MAX_ROTATION * 2, -MAX_ROTATION, MAX_ROTATION);
  const mediaX = clamp((pointerX - 0.5) * MAX_MEDIA_SHIFT * 2, -MAX_MEDIA_SHIFT, MAX_MEDIA_SHIFT);
  const mediaY = clamp((pointerY - 0.5) * -MAX_MEDIA_SHIFT * 2, -MAX_MEDIA_SHIFT, MAX_MEDIA_SHIFT);

  element.style.setProperty("--profile-card-rotate-x", `${rotateX.toFixed(2)}deg`);
  element.style.setProperty("--profile-card-rotate-y", `${rotateY.toFixed(2)}deg`);
  element.style.setProperty("--profile-card-scale", "1.02");
  element.style.setProperty("--profile-card-media-x", `${mediaX.toFixed(2)}px`);
  element.style.setProperty("--profile-card-media-y", `${mediaY.toFixed(2)}px`);
  element.style.setProperty("--profile-card-pointer-x", `${(pointerX * 100).toFixed(2)}%`);
  element.style.setProperty("--profile-card-pointer-y", `${(pointerY * 100).toFixed(2)}%`);
  element.style.setProperty("--profile-card-glow-opacity", "0.72");
}

export function resetProfileCardTilt(element: HTMLElement) {
  element.style.removeProperty("--profile-card-rotate-x");
  element.style.removeProperty("--profile-card-rotate-y");
  element.style.removeProperty("--profile-card-scale");
  element.style.removeProperty("--profile-card-media-x");
  element.style.removeProperty("--profile-card-media-y");
  element.style.removeProperty("--profile-card-pointer-x");
  element.style.removeProperty("--profile-card-pointer-y");
  element.style.removeProperty("--profile-card-glow-opacity");
}

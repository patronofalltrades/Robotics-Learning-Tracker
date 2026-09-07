"use client";

/* Native img keeps user-controlled Google photo URLs out of Next's remote-image allowlist. */
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

type UserAvatarProps = { name?: string | null; photoURL?: string | null; className?: string; decorative?: boolean };

export function UserAvatar({ name, photoURL, className = "", decorative = false }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = name?.trim() || "Learner";
  const initial = displayName.slice(0, 1).toUpperCase();
  const classes = `avatar ${className}`.trim();
  if (photoURL && !imageFailed) return <img className={classes} src={photoURL} alt={decorative ? "" : `${displayName} avatar`} aria-hidden={decorative || undefined} onError={() => setImageFailed(true)} />;
  return <span className={classes} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `${displayName} avatar`} aria-hidden={decorative || undefined}>{initial}</span>;
}

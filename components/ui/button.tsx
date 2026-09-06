"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

/** Local shadcn-style primitive: keeps all button affordances on one accessible surface. */
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "secondary" }>(function Button({ className = "", variant = "solid", ...props }, ref) {
  return <button ref={ref} className={`button ${variant === "secondary" ? "secondary" : ""} ${className}`} {...props} />;
});

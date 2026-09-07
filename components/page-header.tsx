import type { ReactNode } from "react";

export function PageHeader({ density = "standard", eyebrow, title, description, aside, meta, actions, className = "" }: { density?: "compact" | "standard" | "feature"; eyebrow: string; title: string; description?: string; aside?: ReactNode; meta?: ReactNode; actions?: ReactNode; className?: string }) {
  return <header className={`page-header page-header-${density}${aside ? " page-header-has-aside" : ""}${className ? ` ${className}` : ""}`}><div className="page-header-copy"><p className="eyebrow">{eyebrow}</p><h1 className="display">{title}</h1>{description && <p className="lede">{description}</p>}{actions}</div>{aside && <aside className="page-header-aside">{aside}</aside>}{meta && <div className="intro-meta">{meta}</div>}</header>;
}

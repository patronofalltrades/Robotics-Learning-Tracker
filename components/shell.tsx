"use client";

import Link from "next/link";
import { BarChart3, BookOpen, CalendarDays, ChevronDown, Download, LogOut, Menu, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { curriculum } from "../lib/curriculum";
import { useApp } from "./app-provider";
import { UserAvatar } from "./user-avatar";

const links = [
  { href: "/", label: "Learning path", icon: CalendarDays, group: "Study" },
  { href: "/progress", label: "Progress", icon: BarChart3, group: "Notebook" },
  { href: "/resources", label: "Resources", icon: BookOpen, group: "Notebook" },
  { href: "/account", label: "Account", icon: UserRound, group: "Personal" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, progress, saveState, demoMode, user, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const isOffline = saveState === "offline";
  const userName = user?.displayName ?? "Learner";
  const completed = Object.values(progress).reduce((sum, item) => sum + item.completedActivityIds.length, 0);
  const total = curriculum.reduce((sum, week) => sum + week.friday.activities.length + week.saturday.activities.length, 0);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!accountOpen && !open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (accountOpen) { setAccountOpen(false); requestAnimationFrame(() => accountButtonRef.current?.focus()); }
      if (open) { setOpen(false); requestAnimationFrame(() => mobileMenuButtonRef.current?.focus()); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [accountOpen, open]);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!(target instanceof Element) || !target.closest(".avatar-menu")) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [accountOpen]);

  return <div className="app-shell">
    <aside className="study-rail" aria-label="Study navigation">
      <Link className="rail-brand" href="/" aria-label="Robotics Learning Tracker home"><span className="brand-mark">R·</span><span><strong>Robotics</strong><small>field notebook</small></span></Link>
      <div className="rail-progress"><span>{completed}/{total} activities</span><div className="progress-track" role="progressbar" aria-label="Overall activity completion" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}><div className="progress-fill" style={{ width: `${Math.round((completed / total) * 100)}%` }} /></div></div>
      {["Study", "Notebook", "Personal"].map((group) => <div className="rail-group" key={group}><p>{group}</p><nav aria-label={`${group} navigation`}>{links.filter((link) => link.group === group).map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon size={16} aria-hidden="true" /><span>{label}</span></Link>)}</nav></div>)}
      <p className="rail-colophon">12 topics<br />Friday + Saturday</p>
    </aside>
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Robotics Learning Tracker home"><span className="brand-mark">R·</span><span className="brand-copy"><strong>Robotics / Physical AI</strong><span>field notebook</span></span></Link>
      <p className="desktop-context">Learn the system. Defend the design.</p>
      <nav className="desktop-nav" aria-label="Primary navigation">{links.map(({ href, label }) => <Link key={href} href={href} className="nav-link" aria-current={pathname === href ? "page" : undefined}>{label === "Learning path" ? "Path" : label}</Link>)}</nav>
      <div className="topbar-actions"><div className="avatar-menu"><button ref={accountButtonRef} className="avatar-button" type="button" aria-label={`Account menu for ${userName}`} aria-expanded={accountOpen} aria-haspopup="menu" aria-controls="account-menu" onClick={() => setAccountOpen(!accountOpen)}><UserAvatar name={user?.displayName} photoURL={user?.photoURL} decorative className="avatar-shell" /><span className="avatar-name">{userName}</span><ChevronDown size={14} aria-hidden="true" /></button>{accountOpen && <div className="avatar-dropdown" id="account-menu" role="menu"><Link href="/account" role="menuitem" onClick={() => setAccountOpen(false)}><UserRound size={15} aria-hidden="true" /> Account</Link><Link href="/account#export" role="menuitem" onClick={() => setAccountOpen(false)}><Download size={15} aria-hidden="true" /> Export</Link><button type="button" role="menuitem" onClick={signOut}><LogOut size={15} aria-hidden="true" /> Sign out</button></div>}</div><button ref={mobileMenuButtonRef} className="mobile-menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}</button></div>
    </header>
    {open && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">{links.map(({ href, label }) => <Link key={href} href={href} className="nav-link" aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}</nav>}
    <main className="main">{saveState === "saving" && <div className="flash" role="status">Saving your notes…</div>}{saveState === "saved" && <div className="flash" data-kind="success" role="status">Saved to your private notebook.</div>}{isOffline && <div className="flash" role="status">{demoMode ? "Demo mode · changes stay in this preview session." : "Offline · changes are not saved."}</div>}{saveState === "error" && <div className="flash" data-kind="error" role="alert">Could not save. Check your connection and retry.</div>}{children}</main>
    <footer className="footer"><strong>Keep the loop in view.</strong><span>{settings.timezone} · {demoMode ? "local preview" : "private Firestore"}</span><Link href="/account#export">Account settings · Export your log →</Link></footer>
    <nav className="bottom-nav" aria-label="Quick navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon aria-hidden="true" /><span>{label === "Learning path" ? "Path" : label}</span></Link>)}</nav>
  </div>;
}

"use client";
import { useApp } from "../../components/app-provider";
import { Shell } from "../../components/shell";
export default function TrackerLayout({ children }: { children: React.ReactNode }) { const { loading, hydrated, user } = useApp(); if (loading || !hydrated || !user) return <div className="main"><div className="page-intro"><div className="skeleton" style={{ width: "8rem" }} /><div className="skeleton" style={{ width: "min(34rem, 90%)", height: "8rem" }} /></div></div>; return <Shell>{children}</Shell>; }

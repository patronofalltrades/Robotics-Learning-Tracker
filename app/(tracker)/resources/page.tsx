"use client";

import { ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { resources } from "../../../lib/curriculum";
import { PageHeader } from "../../../components/page-header";

const groups = ["course", "video", "book", "paper", "docs", "repository", "essay", "vault"] as const;
const groupLabels: Record<(typeof groups)[number], string> = { course: "Courses", video: "Video lectures", book: "Books", paper: "Research papers", docs: "Documentation", repository: "Code repositories", essay: "Essays", vault: "Vault-derived signals" };

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return resources;
    return resources.filter((resource) => `${resource.title} ${resource.source} ${resource.kind}`.toLocaleLowerCase().includes(needle));
  }, [query]);
  const visibleGroups = groups.filter((kind) => filtered.some((resource) => resource.kind === kind));

  return <>
    <PageHeader density="compact" eyebrow="Reference library" title="Find the source you need." description="Search the course spine, then browse it as a compact technical index." />
    <div className="resource-workspace">
      <aside className="resource-directory" aria-label="Resource directory">
        <label htmlFor="resource-search">Search resources</label>
        <div className="search-field"><Search size={16} aria-hidden="true" /><input id="resource-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “control” or “ROS 2”" /></div>
        <nav className="resource-index" aria-label="Resource groups">{groups.map((kind) => { const count = resources.filter((resource) => resource.kind === kind).length; return count > 0 && <a key={kind} href={`#${kind}`}><span>{groupLabels[kind]}</span><strong>{count}</strong></a>; })}</nav>
      </aside>
      <div className="resource-results" aria-live="polite">
        <p className="result-count">{filtered.length} {filtered.length === 1 ? "source" : "sources"}{query ? ` matching “${query}”` : " in the notebook"}</p>
        {visibleGroups.map((kind) => { const items = filtered.filter((resource) => resource.kind === kind); return <section className="section resource-group" id={kind} key={kind}><div className="section-head resource-group-head"><p className="eyebrow">{kind}</p><h2>{groupLabels[kind]}</h2><span>{items.length}</span></div><div className="resource-list">{items.map((item) => item.url ? <a key={item.id} className="resource-item" href={item.url} target="_blank" rel="noreferrer"><span className="resource-title"><strong>{item.title}</strong><span>{item.source}</span><span className="resource-action">Open source <ExternalLink size={13} aria-hidden="true" /></span></span></a> : <div key={item.id} className="resource-item"><span className="resource-title"><strong>{item.title}</strong><span>{item.source}</span><span className="resource-action">Source note</span></span></div>)}</div></section>; })}
        {!filtered.length && <div className="resource-empty"><Search size={22} aria-hidden="true" /><h2>No source matches that phrase.</h2><p>Try a topic, institution, format, or shorter term.</p><button className="button secondary" type="button" onClick={() => setQuery("")}>Clear search</button></div>}
      </div>
    </div>
  </>;
}

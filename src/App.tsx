import { useState } from "react"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { TldrCard } from "@/components/tldr-card"
import { DataSources } from "@/components/data-sources"
import { PageFooter } from "@/components/page-footer"

type Category = "root" | "stop" | "workflow" | "standards" | "template" | "output" | "mcp" | "inline" | "subrepo"

interface GNode {
  id: string
  label: string
  sub: string
  category: Category
  path?: string
}

const NODES: GNode[] = [
  { id: "root", label: "AGENTS.md", sub: "root router · 258 lines", category: "root", path: "Verkada_Code/AGENTS.md" },
  { id: "stop-docs", label: "STOP: Doc task", sub: "create / update any doc", category: "stop" },
  { id: "stop-sql", label: "STOP: SQL / Query", sub: "Athena, data analytics", category: "stop" },
  { id: "stop-status", label: "STOP: Weekly status", sub: "generate status report", category: "stop" },
  { id: "stop-recap", label: "STOP: Weekly recap", sub: "full recap orchestration", category: "stop" },
  { id: "stop-code", label: "STOP: Code explore", sub: "any Verkada repo", category: "stop" },
  { id: "rbp", label: "Read Before Proceeding", sub: "14 task-specific routes", category: "stop" },
  { id: "inline", label: "Inline rules", sub: "always active in context", category: "inline" },
  { id: "docs-sub", label: "documentation/AGENTS.md", sub: "self-contained for other PMs", category: "subrepo", path: "documentation/AGENTS.md" },
  { id: "doc-workflow", label: "documentation-workflow.md", sub: "04-standards · 1,210 lines", category: "workflow", path: "documentation/04-standards/documentation-workflow.md" },
  { id: "data-pre", label: "data-analytics-preflight.md", sub: "04-standards · query pre-flight", category: "workflow", path: "documentation/04-standards/data-analytics-preflight.md" },
  { id: "wk-readme", label: "weekly-status/README.md", sub: "pre-flight + report format", category: "workflow", path: "documentation/20-core-projects/weekly-status/README.md" },
  { id: "recap-rb", label: "weekly-recap-runbook.md", sub: "407+ lines · full orchestration", category: "workflow", path: "documentation/20-core-projects/weekly-status/weekly-recap-runbook.md" },
  { id: "graphify", label: "<repo>/graphify-out/", sub: "GRAPH_REPORT.md · 5 repos", category: "workflow" },
  { id: "stds", label: "04-standards/", sub: "14 reference docs", category: "standards", path: "documentation/04-standards/" },
  { id: "templates", label: "03-templates/", sub: "30+ doc templates", category: "template", path: "documentation/03-templates/" },
  { id: "mcp-granola", label: "user-Granola MCP", sub: "meeting notes + actions", category: "mcp" },
  { id: "mcp-linear", label: "Linear MCP", sub: "tickets + project status", category: "mcp" },
  { id: "mcp-cal", label: "Google Calendar MCP", sub: "PM time categorization", category: "mcp" },
  { id: "slack-map", label: "slack-channel-mapping.md", sub: "Cowork prompt template", category: "workflow", path: "documentation/20-core-projects/weekly-status/slack-channel-mapping.md" },
  { id: "pm-docs", label: "10-product-managers/", sub: "PM quick refs per service", category: "output", path: "documentation/10-product-managers/" },
  { id: "be-docs", label: "11-backend-services/", sub: "READMEs + api + arch + audit", category: "output", path: "documentation/11-backend-services/" },
  { id: "data-refs", label: "16-data-analytics/", sub: "schemas, catalogs, models", category: "output", path: "documentation/16-data-analytics/" },
  { id: "source", label: "Source code files", sub: "read after graph-guided lookup", category: "output" },
  { id: "wk-out", label: "YYYY-WW-core-status.md", sub: "weekly status report", category: "output", path: "documentation/20-core-projects/weekly-status/" },
  { id: "pm-wk", label: "pm-weeklies/", sub: "ankush, azalea, nikita, vivien", category: "output", path: "documentation/20-core-projects/weekly-status/pm-weeklies/" },
]

const EDGES = [
  { from: "root", to: "stop-docs" }, { from: "root", to: "stop-sql" }, { from: "root", to: "stop-status" },
  { from: "root", to: "stop-recap" }, { from: "root", to: "stop-code" }, { from: "root", to: "rbp" },
  { from: "root", to: "inline" }, { from: "root", to: "docs-sub" },
  { from: "stop-docs", to: "doc-workflow" }, { from: "stop-docs", to: "templates" },
  { from: "stop-sql", to: "data-pre" }, { from: "stop-status", to: "wk-readme" },
  { from: "stop-recap", to: "recap-rb" }, { from: "stop-code", to: "graphify" },
  { from: "rbp", to: "stds" }, { from: "rbp", to: "mcp-granola" },
  { from: "recap-rb", to: "mcp-granola" }, { from: "recap-rb", to: "mcp-linear" },
  { from: "recap-rb", to: "mcp-cal" }, { from: "recap-rb", to: "slack-map" },
  { from: "wk-readme", to: "slack-map" }, { from: "wk-readme", to: "mcp-linear" },
  { from: "doc-workflow", to: "templates" }, { from: "doc-workflow", to: "pm-docs" }, { from: "doc-workflow", to: "be-docs" },
  { from: "templates", to: "pm-docs" }, { from: "templates", to: "be-docs" },
  { from: "data-pre", to: "data-refs" }, { from: "graphify", to: "source" },
  { from: "recap-rb", to: "wk-out" }, { from: "recap-rb", to: "pm-wk" },
]

const CATEGORY_META: Record<Category, { label: string; desc: string; color: string }> = {
  root:      { label: "Router",     desc: "Root AGENTS.md — always loaded",            color: "bg-sky-500 text-white border-sky-500" },
  stop:      { label: "STOP gate",  desc: "Must read before any output",                color: "bg-red-500/20 text-red-300 border-red-500/40" },
  workflow:  { label: "Workflow",   desc: "Primary procedural reference files",         color: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  standards: { label: "Standards",  desc: "04-standards/ reference docs",               color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  template:  { label: "Templates",  desc: "03-templates/ document templates",           color: "bg-teal-500/20 text-teal-300 border-teal-500/40" },
  output:    { label: "Output",     desc: "Final destination directories",              color: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30" },
  mcp:       { label: "MCP tool",   desc: "External tool / data source",                color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  inline:    { label: "Inline",     desc: "Rules baked directly into the router",       color: "bg-muted text-muted-foreground border-border" },
  subrepo:   { label: "Sub-AGENTS", desc: "Scoped AGENTS.md for sub-repos / other PMs", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
}

// DAG arranged as tiers manually since we don't have computeDAGLayout
const TIERS: string[][] = [
  ["root"],
  ["stop-docs", "stop-sql", "stop-status", "stop-recap", "stop-code", "rbp", "inline", "docs-sub"],
  ["doc-workflow", "data-pre", "wk-readme", "recap-rb", "graphify", "stds", "templates", "mcp-granola"],
  ["mcp-linear", "mcp-cal", "slack-map", "pm-docs", "be-docs", "data-refs", "source", "wk-out", "pm-wk"],
]

const DECISION_ROWS = [
  { trigger: "Create / update any doc", gate: "STOP: Doc task", dest: "documentation-workflow.md + 03-templates/", gateType: "stop" },
  { trigger: "Write any SQL or Athena query", gate: "STOP: SQL / Query", dest: "data-analytics-preflight.md → 16-data-analytics/", gateType: "stop" },
  { trigger: "Generate weekly status report", gate: "STOP: Weekly status", dest: "weekly-status/README.md (pre-flight phases 1–7)", gateType: "stop" },
  { trigger: '"run my weekly recap"', gate: "STOP: Weekly recap", dest: "weekly-recap-runbook.md → Linear + Calendar + Granola MCPs", gateType: "stop" },
  { trigger: "Explore code in any Verkada repo", gate: "STOP: Code explore", dest: "<repo>/graphify-out/GRAPH_REPORT.md → source files", gateType: "stop" },
  { trigger: "ASCII diagram", gate: "Read Before Proceeding", dest: "04-standards/ascii-diagram-standards.md", gateType: "rbp" },
  { trigger: "Prose / communications", gate: "Read Before Proceeding", dest: "04-standards/writing-tone-guidelines.md", gateType: "rbp" },
  { trigger: "Org structure / people lookup", gate: "Read Before Proceeding", dest: "14-engineering/org-structure/org-hierarchy.yaml", gateType: "rbp" },
  { trigger: "Customer latency / Datadog", gate: "Read Before Proceeding", dest: "16-data-analytics/datadog-investigation-reference.md", gateType: "rbp" },
  { trigger: "Meeting notes / Granola", gate: "Read Before Proceeding", dest: "user-Granola MCP → query_granola_meetings", gateType: "rbp" },
  { trigger: '"fill in my weekly calendar"', gate: "Inline rule", dest: "pm-weeklies/pm-weekly-config.yaml → Google Calendar MCP", gateType: "inline" },
  { trigger: "Voice transcript / meeting notes", gate: "Inline rule", dest: "Name corrections table (always active in context)", gateType: "inline" },
  { trigger: '"quick publish"', gate: "Inline rule", dest: "documentation/01-scripts/quick-publish.sh", gateType: "inline" },
]

function NodeBox({ node, isHovered, isDimmed, onHover, onLeave }: {
  node: GNode; isHovered: boolean; isDimmed: boolean;
  onHover: () => void; onLeave: () => void;
}) {
  const meta = CATEGORY_META[node.category]
  return (
    <button
      className={cn(
        "rounded-lg border px-3 py-2 text-left transition-all w-44",
        meta.color,
        isHovered ? "ring-2 ring-white/40 scale-105 shadow-lg z-10 relative" : "",
        isDimmed ? "opacity-30" : "",
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="text-xs font-semibold leading-tight">{node.label}</div>
      <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{node.sub}</div>
    </button>
  )
}

export default function App() {
  const [hovered, setHovered] = useState<string | null>(null)

  const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]))
  const hoveredNode = hovered ? nodeById[hovered] : null

  const connectedIds = hovered
    ? new Set(EDGES.filter(e => e.from === hovered || e.to === hovered).flatMap(e => [e.from, e.to]))
    : new Set<string>()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <PageHeader
          type="Agent Routing Map"
          title="AGENTS.md Router Map"
          subtitle="How the root AGENTS.md routes to every downstream file. Every STOP gate means the agent must read the destination before writing output. Hover a node for details."
          createdDate="Apr 22, 2026"
          modifiedDate="May 16, 2026"
          stats={[
            { value: NODES.length, label: "nodes" },
            { value: EDGES.length, label: "edges" },
            { value: DECISION_ROWS.filter(r => r.gateType === "stop").length, label: "STOP gates" },
          ]}
          gradient="radial-gradient(ellipse 70% 60% at 30% 0%, oklch(0.6 0.18 150 / 0.7), transparent), radial-gradient(ellipse 60% 55% at 80% 0%, oklch(0.55 0.2 265 / 0.5), transparent)"
        />

        <TldrCard items={[
          "The root AGENTS.md is always loaded — it routes before any output is generated.",
          "5 STOP gates block output until a specific file is read: doc tasks, SQL queries, status reports, weekly recaps, and code exploration.",
          "The Read Before Proceeding table covers 14 task-specific routes for more granular tasks (diagrams, tone, org lookups, etc.).",
          "3 inline rules are always active in context: calendar fill, voice-to-text corrections, and quick-publish.",
          "Hover any node in the DAG to see which nodes it connects to and receive from.",
        ]} />

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(CATEGORY_META) as Category[]).map(cat => (
            <span key={cat} className={cn("rounded border px-2.5 py-0.5 text-[11px] font-medium", CATEGORY_META[cat].color)}>
              {CATEGORY_META[cat].label}
            </span>
          ))}
        </div>

        {/* Hover detail */}
        <div className="min-h-14 rounded-xl border border-border bg-card px-4 py-3 mb-6 transition-all">
          {hoveredNode ? (
            <div>
              <div className="font-semibold text-sm">{hoveredNode.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{hoveredNode.sub}</div>
              {hoveredNode.path && <div className="text-[11px] text-muted-foreground/60 font-mono mt-0.5">{hoveredNode.path}</div>}
              <div className="text-xs text-muted-foreground mt-0.5">{CATEGORY_META[hoveredNode.category].desc}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Hover a node to see its path and description.</p>
          )}
        </div>

        {/* Tier-based DAG layout */}
        <div className="rounded-xl border border-border bg-card overflow-x-auto p-6 mb-10">
          <div className="flex gap-6 min-w-max">
            {TIERS.map((tier, tierIdx) => (
              <div key={tierIdx} className="flex flex-col gap-3 justify-center">
                <div className="text-[10px] text-muted-foreground/50 text-center font-mono mb-1">Tier {tierIdx}</div>
                {tier.map(nodeId => {
                  const node = nodeById[nodeId]
                  if (!node) return null
                  const isH = hovered === nodeId
                  const isDimmed = hovered != null && !connectedIds.has(nodeId) && hovered !== nodeId
                  return (
                    <NodeBox
                      key={nodeId}
                      node={node}
                      isHovered={isH}
                      isDimmed={isDimmed}
                      onHover={() => setHovered(nodeId)}
                      onLeave={() => setHovered(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground/50 text-center">
            Edges: {EDGES.length} connections · Nodes: {NODES.length}
          </div>
        </div>

        {/* Connections list for hovered node */}
        {hovered && connectedIds.size > 1 && (
          <div className="rounded-xl border border-border bg-card p-5 mb-8">
            <div className="text-sm font-medium mb-3">
              Connections for: <span className="text-foreground">{nodeById[hovered]?.label}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Receives from", items: EDGES.filter(e => e.to === hovered).map(e => nodeById[e.from]).filter(Boolean) },
                { label: "Sends to", items: EDGES.filter(e => e.from === hovered).map(e => nodeById[e.to]).filter(Boolean) },
              ].map(group => group.items.length > 0 && (
                <div key={group.label}>
                  <div className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider mb-2">{group.label}</div>
                  {group.items.map(n => n && (
                    <div key={n.id} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                      <span className={cn("rounded border px-1.5 py-px text-[10px] font-medium", CATEGORY_META[n.category].color)}>{CATEGORY_META[n.category].label}</span>
                      <span className="text-xs">{n.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision table */}
        <h2 className="text-xl font-semibold mb-4">Decision Tree: Task → Destination</h2>
        <div className="rounded-xl border border-border overflow-hidden mb-8">
          {DECISION_ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_180px_1fr] border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="p-3 text-sm italic text-muted-foreground">{row.trigger}</div>
              <div className="p-3 flex items-start justify-center">
                <span className={cn(
                  "rounded border px-2 py-0.5 text-[11px] font-semibold text-center",
                  row.gateType === "stop" ? "bg-red-500/20 text-red-300 border-red-500/30" :
                  row.gateType === "rbp" ? "bg-violet-500/20 text-violet-300 border-violet-500/30" :
                  "bg-muted text-muted-foreground border-border",
                )}>
                  {row.gate}
                </span>
              </div>
              <div className="p-3 text-[11px] font-mono text-muted-foreground leading-relaxed">{row.dest}</div>
            </div>
          ))}
        </div>

        {/* Node directory */}
        <h2 className="text-xl font-semibold mb-4">Node Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {NODES.map(node => (
            <div
              key={node.id}
              className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className={cn("shrink-0 rounded border px-1.5 py-px text-[10px] font-medium mt-0.5", CATEGORY_META[node.category].color)}>
                  {CATEGORY_META[node.category].label}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{node.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{node.sub}</div>
                  {node.path && <div className="text-[10px] text-muted-foreground/50 font-mono mt-0.5 break-all">{node.path}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DataSources
          sources={[
            { label: "AGENTS.md (workspace root)", description: "Root routing file — v6.1, ~260 lines, ~2,700 tokens. All STOP gates and RBP routes derived directly from this file." },
            { label: "04-standards/ reference docs", description: "14 standards files referenced by the Read Before Proceeding table. Each doc governs a specific task type." },
            { label: "documentation-workflow.md", description: "Primary documentation workflow reference — 1,210 lines. Full 5-phase process for PM doc creation." },
          ]}
          methodology="Nodes and edges were extracted manually from AGENTS.md v6.1. Tier layout was hand-assigned based on routing depth from the root node. STOP gates = must-read-first; RBP = conditional read; Inline = always active."
          asOf="May 2026"
        />

        <PageFooter extra="Root AGENTS.md v6.1 · 260 lines · ~2,700 tokens" />
      </main>
    </div>
  )
}

import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { TldrCard } from "@/components/tldr-card"
import { DataSources } from "@/components/data-sources"
import { PageFooter } from "@/components/page-footer"

type Category =
  | "root"
  | "stop"
  | "workflow"
  | "standards"
  | "template"
  | "output"
  | "mcp"
  | "inline"
  | "subrepo"
  | "script"
  | "reference"
  | "config"

interface GNode {
  id: string
  label: string
  sub: string
  category: Category
  path?: string
}

const NODES: GNode[] = [
  // ─── Root ─────────────────────────────────────────────────────────────
  { id: "root", label: "AGENTS.md", sub: "root router · v6.2 · ~370 lines", category: "root", path: "Verkada_Code/AGENTS.md" },

  // ─── 5 STOP gates ─────────────────────────────────────────────────────
  { id: "stop-docs", label: "STOP: Doc task", sub: "create / update any doc", category: "stop" },
  { id: "stop-sql", label: "STOP: SQL / Query", sub: "Athena, data analytics", category: "stop" },
  { id: "stop-status", label: "STOP: Weekly status", sub: "generate status report", category: "stop" },
  { id: "stop-recap", label: "STOP: Weekly recap", sub: '"run my weekly recap"', category: "stop" },
  { id: "stop-code", label: "STOP: Code explore", sub: "any Verkada code repo", category: "stop" },

  // ─── RBP + sub-AGENTS ─────────────────────────────────────────────────
  { id: "rbp", label: "Read Before Proceeding", sub: "16 task-specific routes", category: "stop" },
  { id: "docs-sub", label: "documentation/AGENTS.md", sub: "self-contained for other PMs", category: "subrepo", path: "documentation/AGENTS.md" },

  // ─── Inline rules (always-active in context) ──────────────────────────
  { id: "inline-mcp-first", label: "Rule: MCP-First", sub: "12 MCPs by URL or brand name", category: "inline" },
  { id: "inline-emdash", label: "Rule: Em-dash ban", sub: "no `--` or `—` in any output", category: "inline" },
  { id: "inline-md-fmt", label: "Rule: Markdown format", sub: "tables, diagrams, file naming", category: "inline" },
  { id: "inline-names", label: "Rule: Voice-to-text fixes", sub: "leadership + 'Verkada' phonetics", category: "inline" },
  { id: "inline-gdrive-guard", label: "Rule: Drive deletion guard", sub: "never pass --allow-delete", category: "inline" },
  { id: "inline-config-guard", label: "Rule: Config file guard", sub: ".gitignore, Makefile, etc.", category: "inline" },
  { id: "inline-pmw-sec", label: "Rule: PM weekly secrets", sub: "ankush weeklies stay gitignored", category: "inline" },
  { id: "inline-card-titles", label: "Rule: Card title length", sub: "hub featured ≤30 / regular ≤34", category: "inline" },
  { id: "inline-banned-rules", label: "Rule: Banned rule files", sub: "no .cursorrules, CLAUDE.md, etc.", category: "inline" },
  { id: "inline-gh-cli", label: "Rule: Use gh CLI", sub: "all GitHub work via gh", category: "inline" },
  { id: "inline-gdoc-table", label: "Rule: GDoc table reminder", sub: "after publishing .md with tables", category: "inline" },

  // ─── Inline triggers (specific phrase activation) ─────────────────────
  { id: "inline-quick-pub", label: 'Trigger: "quick publish"', sub: "run quick-publish.sh", category: "inline" },
  { id: "inline-cal-fill", label: 'Trigger: "fill in calendar"', sub: "PM weekly calendar fill", category: "inline" },

  // ─── Primary workflow / preflight references ──────────────────────────
  { id: "doc-router", label: "doc-creation-routing-manifest.md", sub: "single-file routing for any doc task", category: "workflow", path: "documentation/04-standards/doc-creation-routing-manifest.md" },
  { id: "doc-workflow", label: "documentation-workflow.md", sub: "5-phase doc creation workflow", category: "workflow", path: "documentation/04-standards/documentation-workflow.md" },
  { id: "data-pre", label: "data-analytics-preflight.md", sub: "SQL / Athena query pre-flight", category: "workflow", path: "documentation/04-standards/data-analytics-preflight.md" },
  { id: "wk-readme", label: "weekly-status/README.md", sub: "status report pre-flight + format", category: "workflow", path: "documentation/20-core-projects/weekly-status/README.md" },
  { id: "recap-rb", label: "weekly-recap-runbook.md", sub: "full weekly recap orchestration", category: "workflow", path: "documentation/20-core-projects/weekly-status/weekly-recap-runbook.md" },
  { id: "code-explore", label: "code-exploration-preflight.md", sub: "docs-first → graphify → source", category: "workflow", path: "documentation/04-standards/code-exploration-preflight.md" },

  // ─── Code graphs ──────────────────────────────────────────────────────
  { id: "graphify", label: "<repo>/graphify-out/", sub: "GRAPH_REPORT.md across 5 repos", category: "workflow" },
  { id: "crg", label: "code-review-graph", sub: "blast-radius + review companion", category: "workflow" },

  // ─── Standards (RBP bucket + new prominent docs) ──────────────────────
  { id: "stds", label: "04-standards/", sub: "27 reference docs · RBP destination", category: "standards", path: "documentation/04-standards/" },
  { id: "agents-auth", label: "agents-md-authoring-guide.md", sub: "writing or updating AGENTS.md", category: "standards", path: "documentation/04-standards/agents-md-authoring-guide.md" },
  { id: "repomix-guide", label: "repomix-usage-guide.md", sub: "CLI/MCP only · security on", category: "standards", path: "documentation/04-standards/repomix-usage-guide.md" },

  // ─── Templates ────────────────────────────────────────────────────────
  { id: "templates", label: "03-templates/", sub: "34 doc templates (PRD, RCA, UXR…)", category: "template", path: "documentation/03-templates/" },
  { id: "latency-template", label: "latency-investigation-template.md", sub: "Datadog escalation template", category: "template", path: "documentation/03-templates/latency-investigation-template.md" },

  // ─── Scripts (01-scripts/) ────────────────────────────────────────────
  { id: "script-quick-pub", label: "quick-publish.sh", sub: "commit + push docs-vibes to main", category: "script", path: "documentation/01-scripts/quick-publish.sh" },
  { id: "script-sync", label: "sync.sh", sub: "pull all 5 workspace repos", category: "script", path: "documentation/01-scripts/sync.sh" },
  { id: "script-gdoc", label: "gdoc-autosize-tables.py", sub: "post-publish GDoc table sizing", category: "script", path: "documentation/01-scripts/gdoc-autosize-tables.py" },
  { id: "script-validate-md", label: "validate-markdown-pages.sh", sub: "GH Pages markdown lint", category: "script", path: "documentation/01-scripts/validate-markdown-pages.sh" },
  { id: "script-pmw", label: "generate-pm-weekly.sh", sub: "per-PM weekly file routing", category: "script", path: "documentation/01-scripts/generate-pm-weekly.sh" },

  // ─── MCP servers (from MCP-First Rule table + recap runbook) ──────────
  { id: "mcp-granola", label: "Granola MCP", sub: "meeting notes + decisions", category: "mcp" },
  { id: "mcp-linear", label: "Linear MCP", sub: "tickets across 6 teams", category: "mcp" },
  { id: "mcp-cal", label: "Google Calendar MCP", sub: "PM time categorization", category: "mcp" },
  { id: "mcp-notion", label: "Notion MCP", sub: "publish + meeting recall", category: "mcp" },
  { id: "mcp-figma", label: "Figma MCP", sub: "design context + use_figma", category: "mcp" },
  { id: "mcp-slack", label: "Slack MCP (plugin)", sub: "slack.com link routing", category: "mcp" },
  { id: "mcp-cowork", label: "Claude Cowork (Slack)", sub: "70+ channel weekly scan", category: "mcp" },
  { id: "mcp-datadog", label: "Datadog MCP (plugin)", sub: "metrics, RUM, APM, logs", category: "mcp" },
  { id: "mcp-hex", label: "Hex MCP", sub: "warehouse SQL from Cursor", category: "mcp" },
  { id: "mcp-gdrive", label: "Google Drive MCP", sub: "Docs / Drive link routing", category: "mcp" },
  { id: "mcp-lucid", label: "Lucid MCP", sub: "Lucidchart / Lucidspark", category: "mcp" },
  { id: "mcp-perplexity", label: "Perplexity MCP", sub: "web-grounded research", category: "mcp" },
  { id: "mcp-repomix", label: "Repomix MCP", sub: "pack repo for AI consumption", category: "mcp" },

  // ─── Reference files / configs ────────────────────────────────────────
  { id: "slack-map", label: "slack-channel-mapping.md", sub: "70+ channels by team + tier", category: "reference", path: "documentation/20-core-projects/weekly-status/slack-channel-mapping.md" },
  { id: "datadog-runbook", label: "datadog-investigation-reference.md", sub: "latency escalation runbook", category: "reference", path: "documentation/16-data-analytics/runbooks/datadog-investigation-reference.md" },
  { id: "data-infra", label: "data-infrastructure-reference.md", sub: "warehouse + analytics infra", category: "reference", path: "documentation/16-data-analytics/reference/data-infrastructure-reference.md" },
  { id: "org-yaml", label: "org-hierarchy.yaml", sub: "team + people lookups", category: "reference", path: "documentation/14-engineering/org-structure/org-hierarchy.yaml" },
  { id: "pm-wk-config", label: "pm-weekly-config.yaml", sub: "calendar + areas per PM", category: "config", path: "documentation/20-core-projects/weekly-status/pm-weeklies/pm-weekly-config.yaml" },

  // ─── Output directories ───────────────────────────────────────────────
  { id: "pm-docs", label: "10-product-managers/", sub: "PM quick refs per service", category: "output", path: "documentation/10-product-managers/" },
  { id: "be-docs", label: "11-backend-services/", sub: "90+ services · arch + api + audit", category: "output", path: "documentation/11-backend-services/" },
  { id: "data-refs", label: "16-data-analytics/", sub: "schemas, catalogs, datasets", category: "output", path: "documentation/16-data-analytics/" },
  { id: "source", label: "Source code files", sub: "read after graph-guided lookup", category: "output" },
  { id: "wk-out", label: "YYYY-WW-core-status.md", sub: "weekly Core status report", category: "output", path: "documentation/20-core-projects/weekly-status/" },
  { id: "pm-wk", label: "pm-weeklies/", sub: "azalea, nikita, vivien (committed)", category: "output", path: "documentation/20-core-projects/weekly-status/pm-weeklies/" },
  { id: "pm-wk-ankush", label: "80-workspaces/ankush.rustagi/", sub: "ankush pm-weeklies (gitignored)", category: "output", path: "documentation/80-workspaces/ankush.rustagi/pm-weeklies/" },
  { id: "slack-intel", label: "core-leads/slack-intel/", sub: "canonical Slack intel output", category: "output", path: "documentation/20-core-projects/core-leads/slack-intel/" },
]

const EDGES = [
  // Root → primary route entries
  { from: "root", to: "stop-docs" },
  { from: "root", to: "stop-sql" },
  { from: "root", to: "stop-status" },
  { from: "root", to: "stop-recap" },
  { from: "root", to: "stop-code" },
  { from: "root", to: "rbp" },
  { from: "root", to: "docs-sub" },

  // Root → inline rules (always-active)
  { from: "root", to: "inline-mcp-first" },
  { from: "root", to: "inline-emdash" },
  { from: "root", to: "inline-md-fmt" },
  { from: "root", to: "inline-names" },
  { from: "root", to: "inline-gdrive-guard" },
  { from: "root", to: "inline-config-guard" },
  { from: "root", to: "inline-pmw-sec" },
  { from: "root", to: "inline-card-titles" },
  { from: "root", to: "inline-banned-rules" },
  { from: "root", to: "inline-gh-cli" },
  { from: "root", to: "inline-gdoc-table" },
  { from: "root", to: "inline-quick-pub" },
  { from: "root", to: "inline-cal-fill" },

  // STOP: Doc task → routing manifest, then workflow + templates
  { from: "stop-docs", to: "doc-router" },
  { from: "doc-router", to: "doc-workflow" },
  { from: "doc-router", to: "templates" },
  { from: "doc-workflow", to: "templates" },
  { from: "doc-workflow", to: "pm-docs" },
  { from: "doc-workflow", to: "be-docs" },
  { from: "templates", to: "pm-docs" },
  { from: "templates", to: "be-docs" },

  // STOP: SQL → data-pre → references and warehouse
  { from: "stop-sql", to: "data-pre" },
  { from: "data-pre", to: "data-refs" },
  { from: "data-pre", to: "data-infra" },
  { from: "data-pre", to: "mcp-hex" },

  // STOP: Weekly status → readme → MCPs + slack map
  { from: "stop-status", to: "wk-readme" },
  { from: "wk-readme", to: "slack-map" },
  { from: "wk-readme", to: "mcp-linear" },
  { from: "wk-readme", to: "wk-out" },

  // STOP: Weekly recap → runbook → all 5 weekly data sources + outputs
  { from: "stop-recap", to: "recap-rb" },
  { from: "recap-rb", to: "mcp-granola" },
  { from: "recap-rb", to: "mcp-linear" },
  { from: "recap-rb", to: "mcp-cal" },
  { from: "recap-rb", to: "mcp-cowork" },
  { from: "recap-rb", to: "slack-map" },
  { from: "recap-rb", to: "pm-wk-config" },
  { from: "recap-rb", to: "script-pmw" },
  { from: "recap-rb", to: "wk-out" },
  { from: "recap-rb", to: "pm-wk" },
  { from: "recap-rb", to: "slack-intel" },
  { from: "script-pmw", to: "pm-wk-ankush" },
  { from: "script-pmw", to: "pm-wk" },

  // STOP: Code explore → preflight → graphify + CRG → source
  { from: "stop-code", to: "code-explore" },
  { from: "code-explore", to: "graphify" },
  { from: "code-explore", to: "crg" },
  { from: "graphify", to: "source" },
  { from: "crg", to: "source" },

  // Read Before Proceeding → standards bucket + specifically-routed targets
  { from: "rbp", to: "stds" },
  { from: "rbp", to: "agents-auth" },
  { from: "rbp", to: "datadog-runbook" },
  { from: "rbp", to: "org-yaml" },
  { from: "rbp", to: "latency-template" },
  { from: "rbp", to: "mcp-granola" },

  // MCP-First Rule fans out to every server in the routing table
  { from: "inline-mcp-first", to: "mcp-figma" },
  { from: "inline-mcp-first", to: "mcp-linear" },
  { from: "inline-mcp-first", to: "mcp-notion" },
  { from: "inline-mcp-first", to: "mcp-slack" },
  { from: "inline-mcp-first", to: "mcp-granola" },
  { from: "inline-mcp-first", to: "mcp-hex" },
  { from: "inline-mcp-first", to: "mcp-datadog" },
  { from: "inline-mcp-first", to: "mcp-lucid" },
  { from: "inline-mcp-first", to: "mcp-gdrive" },
  { from: "inline-mcp-first", to: "mcp-cal" },
  { from: "inline-mcp-first", to: "mcp-perplexity" },
  { from: "inline-mcp-first", to: "mcp-repomix" },
  { from: "inline-mcp-first", to: "repomix-guide" },

  // Inline trigger words → underlying actions
  { from: "inline-quick-pub", to: "script-quick-pub" },
  { from: "inline-cal-fill", to: "pm-wk-config" },
  { from: "inline-cal-fill", to: "mcp-cal" },
  { from: "inline-cal-fill", to: "pm-wk" },
  { from: "inline-gdoc-table", to: "script-gdoc" },
  { from: "inline-md-fmt", to: "script-validate-md" },
  { from: "inline-pmw-sec", to: "pm-wk-ankush" },
]

const CATEGORY_META: Record<Category, { label: string; desc: string; color: string }> = {
  root:      { label: "Router",     desc: "Root AGENTS.md — always loaded",            color: "bg-sky-500 text-white border-sky-500" },
  stop:      { label: "STOP gate",  desc: "Must read before any output",                color: "bg-red-500/20 text-red-300 border-red-500/40" },
  workflow:  { label: "Workflow",   desc: "Primary procedural reference files",         color: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  standards: { label: "Standards",  desc: "04-standards/ reference docs",               color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  template:  { label: "Templates",  desc: "03-templates/ document templates",           color: "bg-teal-500/20 text-teal-300 border-teal-500/40" },
  script:    { label: "Script",     desc: "Automation in 01-scripts/",                  color: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40" },
  reference: { label: "Reference",  desc: "Lookup files cited by routes / runbooks",    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  config:    { label: "Config",     desc: "YAML / config consumed by scripts + agents", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  output:    { label: "Output",     desc: "Final destination directories",              color: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30" },
  mcp:       { label: "MCP tool",   desc: "External tool / data source",                color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  inline:    { label: "Inline",     desc: "Rules + trigger words baked into the router", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
  subrepo:   { label: "Sub-AGENTS", desc: "Scoped AGENTS.md for sub-repos / other PMs", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
}

// Layered DAG, now read top-to-bottom. Each tier renders as a horizontal
// flex-wrap row so wide tiers (inline rules, MCP servers) wrap across the
// available width instead of stacking into a 1500px-tall column. Tiers
// also get a short subtitle since groups within a tier can be visually
// scanned by category color.
interface TierGroup {
  label: string
  nodes: string[]
}
interface Tier {
  label: string
  caption: string
  groups: TierGroup[]
}

const TIERS: Tier[] = [
  {
    label: "Root",
    caption: "Always loaded before any output",
    groups: [{ label: "", nodes: ["root"] }],
  },
  {
    label: "STOP gates + sub-routers",
    caption: "Hard pre-flights and the docs-only sub-AGENTS for other PMs",
    groups: [
      { label: "STOP gates", nodes: ["stop-docs", "stop-sql", "stop-status", "stop-recap", "stop-code"] },
      { label: "Routing + sub-AGENTS", nodes: ["rbp", "docs-sub"] },
    ],
  },
  {
    label: "Inline rules",
    caption: "Always-active baseline behavior and trigger phrases",
    groups: [
      {
        label: "Always-active",
        nodes: [
          "inline-mcp-first", "inline-emdash", "inline-md-fmt", "inline-names",
          "inline-gdrive-guard", "inline-config-guard", "inline-pmw-sec",
          "inline-card-titles", "inline-banned-rules", "inline-gh-cli",
          "inline-gdoc-table",
        ],
      },
      { label: "Trigger phrases", nodes: ["inline-quick-pub", "inline-cal-fill"] },
    ],
  },
  {
    label: "Workflow + standards references",
    caption: "Primary destinations from STOP gates and the RBP table",
    groups: [
      { label: "Workflows", nodes: ["doc-router", "doc-workflow", "data-pre", "wk-readme", "recap-rb", "code-explore"] },
      { label: "Code graphs", nodes: ["graphify", "crg"] },
      { label: "Standards + templates", nodes: ["stds", "agents-auth", "repomix-guide", "templates", "latency-template"] },
    ],
  },
  {
    label: "Tools + data sources",
    caption: "MCP servers, scripts, and lookup files cited by the workflows",
    groups: [
      {
        label: "MCP servers (MCP-First Rule)",
        nodes: [
          "mcp-granola", "mcp-linear", "mcp-cal", "mcp-notion", "mcp-figma",
          "mcp-slack", "mcp-cowork", "mcp-datadog", "mcp-hex", "mcp-gdrive",
          "mcp-lucid", "mcp-perplexity", "mcp-repomix",
        ],
      },
      {
        label: "Scripts (01-scripts/)",
        nodes: ["script-quick-pub", "script-sync", "script-gdoc", "script-validate-md", "script-pmw"],
      },
      {
        label: "Lookups + configs",
        nodes: ["slack-map", "datadog-runbook", "data-infra", "org-yaml", "pm-wk-config"],
      },
    ],
  },
  {
    label: "Final outputs",
    caption: "Where the agent's work lands",
    groups: [
      {
        label: "",
        nodes: [
          "pm-docs", "be-docs", "data-refs", "source",
          "wk-out", "pm-wk", "pm-wk-ankush", "slack-intel",
        ],
      },
    ],
  },
]

const DECISION_ROWS = [
  // ─── 5 STOP gates ────────────────────────────────────────────────────
  { trigger: "Create / update any doc", gate: "STOP: Doc task", dest: "doc-creation-routing-manifest.md → documentation-workflow.md + 03-templates/", gateType: "stop" },
  { trigger: "Write any SQL or Athena query", gate: "STOP: SQL / Query", dest: "data-analytics-preflight.md → 16-data-analytics/ + Hex MCP", gateType: "stop" },
  { trigger: "Generate weekly status report", gate: "STOP: Weekly status", dest: "weekly-status/README.md (pre-flight phases 1-7)", gateType: "stop" },
  { trigger: '"run my weekly recap"', gate: "STOP: Weekly recap", dest: "weekly-recap-runbook.md → Linear + Calendar + Granola + Cowork", gateType: "stop" },
  { trigger: "Explore code in any Verkada repo", gate: "STOP: Code explore", dest: "code-exploration-preflight.md → graphify + CRG → source", gateType: "stop" },

  // ─── 16 Read Before Proceeding routes ────────────────────────────────
  { trigger: "Doc routing / template / service lookup", gate: "Read Before Proceeding", dest: "04-standards/doc-creation-routing-manifest.md", gateType: "rbp" },
  { trigger: "ASCII diagram or flowchart", gate: "Read Before Proceeding", dest: "04-standards/ascii-diagram-standards.md", gateType: "rbp" },
  { trigger: "Prose, copy, or communications", gate: "Read Before Proceeding", dest: "04-standards/writing-tone-guidelines.md", gateType: "rbp" },
  { trigger: "Formatting markdown documents", gate: "Read Before Proceeding", dest: "04-standards/markdown-formatting-standards.md", gateType: "rbp" },
  { trigger: "Naming files or folders", gate: "Read Before Proceeding", dest: "04-standards/naming-and-organization-conventions.md", gateType: "rbp" },
  { trigger: "Making a git commit", gate: "Read Before Proceeding", dest: "04-standards/commit-message-guide.md", gateType: "rbp" },
  { trigger: "Writing or updating AGENTS.md files", gate: "Read Before Proceeding", dest: "04-standards/agents-md-authoring-guide.md", gateType: "rbp" },
  { trigger: "Setting up a new PM workspace", gate: "Read Before Proceeding", dest: "04-standards/workspace-setup-guide.md", gateType: "rbp" },
  { trigger: "Verkada products, hardware, SKUs", gate: "Read Before Proceeding", dest: "04-standards/product-hardware-reference.md", gateType: "rbp" },
  { trigger: "Reviewing or vetting code quality", gate: "Read Before Proceeding", dest: "04-standards/code-review-guide.md", gateType: "rbp" },
  { trigger: "Quarters / FY / planning cycles", gate: "Read Before Proceeding", dest: "04-standards/verkada-calendar-and-quarters.md (QxFYyy)", gateType: "rbp" },
  { trigger: "Org structure / people lookup", gate: "Read Before Proceeding", dest: "14-engineering/org-structure/org-hierarchy.yaml", gateType: "rbp" },
  { trigger: "Data infrastructure / analytics", gate: "Read Before Proceeding", dest: "16-data-analytics/reference/data-infrastructure-reference.md", gateType: "rbp" },
  { trigger: "Product analytics, adoption metrics", gate: "Read Before Proceeding", dest: "16-data-analytics/reference/base-datasets-reference.md", gateType: "rbp" },
  { trigger: "Salesforce / SFDC field selection", gate: "Read Before Proceeding", dest: "16-data-analytics/reference/salesforce-clean-fields-reference.md", gateType: "rbp" },
  { trigger: "Customer latency / Datadog", gate: "Read Before Proceeding", dest: "datadog-investigation-reference.md + latency-investigation-template.md", gateType: "rbp" },
  { trigger: "Slack channel scanning / Slack intel", gate: "Read Before Proceeding", dest: "slack-channel-mapping.md → core-leads/slack-intel/", gateType: "rbp" },
  { trigger: "Meeting notes / Granola", gate: "Read Before Proceeding", dest: "Granola Cursor plugin → query_granola_meetings", gateType: "rbp" },

  // ─── Inline rules with trigger phrases ───────────────────────────────
  { trigger: '"quick publish" (any variation)', gate: "Inline rule", dest: "01-scripts/quick-publish.sh (never --allow-delete)", gateType: "inline" },
  { trigger: '"fill in my weekly calendar"', gate: "Inline rule", dest: "pm-weekly-config.yaml + Google Calendar MCP", gateType: "inline" },

  // ─── Always-active inline rules (baseline behavior) ──────────────────
  { trigger: "URL / brand name matches an MCP", gate: "Always-active", dest: "Use that MCP first (12 servers in routing table)", gateType: "inline" },
  { trigger: "Any output, anywhere", gate: "Always-active", dest: "No em-dash, no `--` (em-dash + double-hyphen ban)", gateType: "inline" },
  { trigger: "Any voice transcript or dictation", gate: "Always-active", dest: "Voice-to-text name correction table (silent)", gateType: "inline" },
  { trigger: "Any GitHub work", gate: "Always-active", dest: "Use gh CLI (no web UI for PRs / issues / runs)", gateType: "inline" },
  { trigger: "Publishing .md with tables to Drive", gate: "Always-active", dest: "Remind user to run gdoc-autosize-tables.py", gateType: "inline" },
  { trigger: "Editing .gitignore / Makefile / etc.", gate: "Always-active", dest: "Never Write tool, only StrReplace (append-only)", gateType: "inline" },
  { trigger: "Ankush PM weekly file", gate: "Always-active", dest: "Route to 80-workspaces/ (gitignored), never commit", gateType: "inline" },
  { trigger: "Adding hub portfolio card", gate: "Always-active", dest: "Featured title ≤30 chars · regular ≤34 chars", gateType: "inline" },
  { trigger: "Encountering .cursorrules / CLAUDE.md", gate: "Always-active", dest: "Stop and alert user (banned agent rules files)", gateType: "inline" },
]

function NodeBox({ node, isHovered, isDimmed, onHover, onLeave }: {
  node: GNode; isHovered: boolean; isDimmed: boolean;
  onHover: () => void; onLeave: () => void;
}) {
  const meta = CATEGORY_META[node.category]
  return (
    <button
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-left transition-all w-44",
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

/**
 * Floating inspector. Fixed position so it never reflows the page when
 * the hover state changes and never steals horizontal space from the
 * diagram. Collapses to a small hint chip when nothing is hovered, and
 * expands to a full card with the node's category, path, description,
 * and connection lists when a node is hovered.
 */
function FloatingInspector({
  hovered,
  hoveredNode,
  nodeById,
}: {
  hovered: string | null
  hoveredNode: GNode | null
  nodeById: Record<string, GNode>
}) {
  const receivesFrom = hovered
    ? EDGES.filter((e) => e.to === hovered).map((e) => nodeById[e.from]).filter(Boolean)
    : []
  const sendsTo = hovered
    ? EDGES.filter((e) => e.from === hovered).map((e) => nodeById[e.to]).filter(Boolean)
    : []

  return (
    <aside
      className={cn(
        "fixed z-50 transition-all duration-200",
        // Bottom-right on lg+, full-width sticky to bottom on smaller screens.
        "left-3 right-3 bottom-3 md:left-auto md:right-6 md:bottom-6",
        "md:w-[380px]",
        hoveredNode ? "opacity-100" : "opacity-90",
      )}
    >
      <div
        className={cn(
          "rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl",
          "max-h-[60vh] overflow-y-auto",
          hoveredNode ? "p-4" : "px-4 py-2.5",
        )}
      >
        {hoveredNode ? (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={cn(
                  "inline-block rounded border px-1.5 py-px text-[10px] font-medium",
                  CATEGORY_META[hoveredNode.category].color,
                )}
              >
                {CATEGORY_META[hoveredNode.category].label}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-mono">
                Inspector
              </span>
            </div>
            <div className="font-semibold text-sm leading-snug">{hoveredNode.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{hoveredNode.sub}</div>
            {hoveredNode.path && (
              <div className="text-[11px] text-muted-foreground/60 font-mono mt-2 break-all">
                {hoveredNode.path}
              </div>
            )}
            <div className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
              {CATEGORY_META[hoveredNode.category].desc}
            </div>

            {(receivesFrom.length > 0 || sendsTo.length > 0) && (
              <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
                {receivesFrom.length > 0 && (
                  <ConnectionList label={`Receives from (${receivesFrom.length})`} items={receivesFrom} />
                )}
                {sendsTo.length > 0 && (
                  <ConnectionList label={`Sends to (${sendsTo.length})`} items={sendsTo} />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground/80 leading-snug flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground/50 animate-pulse" />
            Hover any node to see its routing chain.
          </div>
        )}
      </div>
    </aside>
  )
}

function ConnectionList({ label, items }: { label: string; items: GNode[] }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="space-y-1.5">
        {items.map((n) => (
          <div key={n.id} className="flex items-center gap-2">
            <span
              className={cn(
                "shrink-0 rounded border px-1.5 py-px text-[10px] font-medium",
                CATEGORY_META[n.category].color,
              )}
            >
              {CATEGORY_META[n.category].label}
            </span>
            <span className="text-xs leading-tight">{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface EdgePath {
  from: string
  to: string
  d: string
}

export default function App() {
  const [hovered, setHovered] = useState<string | null>(null)

  const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]))
  const hoveredNode = hovered ? nodeById[hovered] : null

  const connectedIds = hovered
    ? new Set(EDGES.filter(e => e.from === hovered || e.to === hovered).flatMap(e => [e.from, e.to]))
    : new Set<string>()

  // Connector geometry: measured from real DOM positions after layout so the
  // curves stay anchored to the actual node boxes through resizes, font load
  // shifts, and the lg/stacked breakpoint flip. We recompute on resize but
  // NOT on hover, since hover only re-styles existing paths.
  const tiersRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [edgePaths, setEdgePaths] = useState<EdgePath[]>([])
  const [svgSize, setSvgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const recompute = () => {
      const container = tiersRef.current
      if (!container) return
      const cBox = container.getBoundingClientRect()
      setSvgSize({ w: container.scrollWidth, h: container.scrollHeight })
      const computed: EdgePath[] = []
      for (const e of EDGES) {
        const fromEl = nodeRefs.current[e.from]
        const toEl = nodeRefs.current[e.to]
        if (!fromEl || !toEl) continue
        const fb = fromEl.getBoundingClientRect()
        const tb = toEl.getBoundingClientRect()
        // Vertical bezier: source bottom-center → target top-center. The
        // top-down tier layout makes this the natural curve direction.
        const x1 = fb.left + fb.width / 2 - cBox.left
        const y1 = fb.bottom - cBox.top
        const x2 = tb.left + tb.width / 2 - cBox.left
        const y2 = tb.top - cBox.top
        const dy = Math.max((y2 - y1) * 0.5, 32)
        computed.push({
          from: e.from,
          to: e.to,
          d: `M ${x1},${y1} C ${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`,
        })
      }
      setEdgePaths(computed)
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    if (tiersRef.current) ro.observe(tiersRef.current)
    window.addEventListener("resize", recompute)
    // Fonts loading after first paint can shift node widths slightly; a
    // delayed second pass catches those without needing a font-loaded event.
    const t = window.setTimeout(recompute, 250)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", recompute)
      window.clearTimeout(t)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1320px] px-4 md:px-6 py-10">
        <PageHeader
          type="Agent Routing Map"
          title="AGENTS.md Router Map"
          subtitle="How the root AGENTS.md routes to every downstream file, script, MCP, and output. Every STOP gate means the agent must read the destination before writing output. Hover any node for details."
          createdDate="Apr 22, 2026"
          modifiedDate="May 26, 2026"
          stats={[
            { value: NODES.length, label: "nodes" },
            { value: EDGES.length, label: "edges" },
            { value: DECISION_ROWS.filter(r => r.gateType === "stop").length, label: "STOP gates" },
            { value: DECISION_ROWS.filter(r => r.gateType === "rbp").length, label: "RBP routes" },
            { value: NODES.filter(n => n.category === "mcp").length, label: "MCP servers" },
          ]}
          gradient="radial-gradient(ellipse 70% 60% at 30% 0%, oklch(0.6 0.18 150 / 0.7), transparent), radial-gradient(ellipse 60% 55% at 80% 0%, oklch(0.55 0.2 265 / 0.5), transparent)"
        />

        <TldrCard items={[
          "The root AGENTS.md (v6.2, ~370 lines) is always loaded and routes before any output is generated.",
          "5 STOP gates block output until a specific file is read: doc tasks (now via doc-creation-routing-manifest.md), SQL queries, status reports, weekly recaps, and code exploration (now via code-exploration-preflight.md).",
          "16 Read Before Proceeding routes cover granular tasks: diagrams, tone, markdown, naming, commits, calendar/QxFYyy, org, hardware, data infra, SFDC, Datadog, Slack, Granola, and more.",
          "13 always-active inline rules govern baseline behavior (MCP-First, em-dash ban, voice-to-text, GH CLI, Drive guard, config guard, banned rule files, card-title length, etc.).",
          "MCP-First Rule fans out to 13 servers (Granola, Linear, Calendar, Figma, Notion, Slack, Cowork, Datadog, Hex, Drive, Lucid, Perplexity, Repomix). Weekly recap pulls 5 of them in parallel.",
          "Code exploration is now a two-tool stack: graphify for the overall map, code-review-graph (CRG) for blast radius and review-time deep dives.",
          "Edges hidden at rest. Hover any node to light up just that node's upstream and downstream chain; the floating inspector (bottom-right) shows file path, description, and a list of every neighbor.",
        ]} />

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(CATEGORY_META) as Category[]).map(cat => (
            <span key={cat} className={cn("rounded border px-2.5 py-0.5 text-[11px] font-medium", CATEGORY_META[cat].color)}>
              {CATEGORY_META[cat].label}
            </span>
          ))}
        </div>

        {/* Diagram (vertical / top-down)
            -----------------------------------
            Previous horizontal layout made tier 1 stack 20 nodes deep
            (~1500px tall) and stole 300px of width for the inspector,
            which clipped tier 4. The new layout flows top-to-bottom:
            each tier is a horizontal flex-wrap row that uses the full
            page width, and the inspector floats in the bottom-right
            instead of competing for horizontal space.

            Edges are hidden at rest (strokeOpacity 0). They only render
            for the hovered node's upstream + downstream chain. With 79
            edges any rest-state opacity creates a noise mat that buries
            the hover signal. */}
        <div className="rounded-xl border border-border bg-card p-5 mb-10">
          <div ref={tiersRef} className="relative flex flex-col gap-10">
            {/* Connector overlay. Covers the entire stack of tiers. */}
            <svg
              className="absolute inset-0 pointer-events-none text-foreground"
              width={svgSize.w}
              height={svgSize.h}
              style={{ width: svgSize.w, height: svgSize.h }}
              aria-hidden
            >
              {edgePaths.map((p) => {
                const isConnected = hovered != null && (p.from === hovered || p.to === hovered)
                if (!isConnected) return null
                return (
                  <path
                    key={`${p.from}-${p.to}`}
                    d={p.d}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeOpacity={0.75}
                    strokeLinecap="round"
                    className="transition-[stroke-opacity,stroke-width] duration-150"
                  />
                )
              })}
            </svg>

            {TIERS.map((tier, tierIdx) => (
              <div key={tierIdx} className="relative z-10">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground/60">
                    Tier {tierIdx}
                  </span>
                  <span className="text-xs font-semibold text-foreground/80">{tier.label}</span>
                  <span className="text-[11px] text-muted-foreground/60">{tier.caption}</span>
                </div>

                <div className={cn(
                  "flex flex-wrap gap-x-3 gap-y-3",
                  tierIdx === 0 && "justify-center",
                )}>
                  {tier.groups.map((group, groupIdx) => (
                    <div
                      key={groupIdx}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-lg",
                        // Visually separate subgroups when a tier has more
                        // than one. Single-group tiers don't need the box.
                        tier.groups.length > 1 && "border border-border/40 bg-background/30 p-2",
                      )}
                    >
                      {tier.groups.length > 1 && group.label && (
                        <div className="text-[10px] font-mono text-muted-foreground/60 px-1">
                          {group.label}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {group.nodes.map((nodeId) => {
                          const node = nodeById[nodeId]
                          if (!node) return null
                          const isH = hovered === nodeId
                          const isDimmed = hovered != null && !connectedIds.has(nodeId) && hovered !== nodeId
                          return (
                            <div
                              key={nodeId}
                              ref={(el) => { nodeRefs.current[nodeId] = el }}
                            >
                              <NodeBox
                                node={node}
                                isHovered={isH}
                                isDimmed={isDimmed}
                                onHover={() => setHovered(nodeId)}
                                onLeave={() => setHovered(null)}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 text-xs text-muted-foreground/50 text-center">
            {NODES.length} nodes · {EDGES.length} edges · Hover any node to highlight its routing chain
          </div>
        </div>

        {/* Floating inspector. Fixed bottom-right so it never steals
            horizontal space from the diagram, but stays visible while
            the user hovers. On viewports under `md` it pins to the
            bottom edge full-width so it doesn't obscure the diagram. */}
        <FloatingInspector
          hovered={hovered}
          hoveredNode={hoveredNode}
          nodeById={nodeById}
        />

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
            { label: "AGENTS.md (workspace root)", description: "Root routing file. v6.2, ~370 lines. All STOP gates, RBP routes, inline rules, and the MCP-First Rule are derived directly from this file." },
            { label: "documentation/README.md (docs-vibes home)", description: "Source for the 7 named PM workflows (weekly recap, Hex + Datadog analytics, RCA, Slack intel, Notion + Granola, template structuring, publish + sync). Used to wire the script and MCP nodes." },
            { label: "04-standards/ reference docs", description: "27 standards files referenced by the Read Before Proceeding table. Each doc governs a specific task type." },
            { label: "weekly-recap-runbook.md", description: "Primary weekly recap orchestration reference. Wires Linear, Calendar, Granola, Cowork (Slack), and the EM Friday recap sheet into the recap pipeline." },
            { label: "code-exploration-preflight.md", description: "Authoritative ordering for any code investigation: PM docs first, then backend / frontend-map / cross-product docs, then graphify, then CRG for deep dives, then raw source." },
          ]}
          methodology="Nodes and edges extracted manually from AGENTS.md v6.2 and documentation/README.md. Categories now include scripts, references, configs, and outputs alongside STOP / RBP / inline. Tier layout is hand-assigned by routing depth from the root. STOP = must-read-first, RBP = conditional read, Inline = always active or trigger-word activated."
          asOf="May 26, 2026"
        />

        <PageFooter extra="Root AGENTS.md v6.2 · ~370 lines · 13 inline rules · 16 RBP routes · 5 STOP gates · 13 MCPs" />
      </main>
    </div>
  )
}

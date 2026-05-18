import { ArrowLeft, GitBranch, FileText, Workflow, Network } from "lucide-react"

const SCOPE = [
  {
    icon: Network,
    title: "DAG router graph",
    desc: "Horizontal directed-acyclic graph showing how AGENTS.md routes task types to workflows, standards, and outputs.",
  },
  {
    icon: GitBranch,
    title: "Decision table",
    desc: "Every task type with its required pre-read, workflow path, and output format, in a filterable table.",
  },
  {
    icon: FileText,
    title: "Node catalogue",
    desc: "All STOP rules, standards files, templates, and MCP triggers referenced in the router, with descriptions.",
  },
  {
    icon: Workflow,
    title: "Path explorer",
    desc: "Click any task type and trace the full decision path from request to output, step by step.",
  },
]

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px] -z-10 opacity-45"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 25% 25%, oklch(0.62 0.18 150 / 0.85), transparent), radial-gradient(ellipse 60% 55% at 78% 75%, oklch(0.55 0.2 265 / 0.7), transparent), linear-gradient(135deg, oklch(0.22 0.07 150), oklch(0.2 0.08 265))",
        }}
      />

      <main className="relative mx-auto max-w-3xl px-6 py-16 md:py-24">
        <a
          href="https://ankush-rustagi.github.io/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="size-4" />
          Back to index
        </a>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium uppercase tracking-wider mb-6">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Work in progress
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-6">
            AGENTS.md
            <br />
            <span className="text-muted-foreground">Router Map.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-prose leading-relaxed">
            A visual graph of how the Verkada PM workspace{" "}
            <span className="font-mono text-sm text-foreground/80">AGENTS.md</span>{" "}
            routes every task type to the right workflow, standards file, and
            output format. Built to answer:{" "}
            <em className="text-foreground/80 not-italic">
              what does the AI actually do when you ask it something?
            </em>
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
            What's coming
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCOPE.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <item.icon className="size-5 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-border bg-card/30 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Status
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-1">
            Source canvas built in Cursor:{" "}
            <span className="text-foreground/80 font-mono text-xs">2026-04-22</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Porting the SVG DAG layout and decision table to interactive standalone web app.
          </p>
        </section>

        <footer className="mt-24 pt-6 border-t border-border text-xs text-muted-foreground">
          <p>Ankush Rustagi · Verkada Product</p>
        </footer>
      </main>
    </div>
  )
}

export default App

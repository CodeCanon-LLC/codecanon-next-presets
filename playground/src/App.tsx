import {
  ThemeProvider,
  PresetProvider,
  type PresetTuple,
  PRESETS,
  PresetDropdownPicker,
  PresetPicker,
} from "@codecanon/next-presets"
import { Palette } from "lucide-react"

function ColorSwatch({ label, variable }: { label: string; variable: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="border-border/50 h-10 w-full rounded-md border"
        style={{ background: `var(${variable})` }}
      />
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

function DemoCard({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
      <h2 className="mb-0.5 text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground mb-4 text-xs">{description}</p>
      {children}
    </div>
  )
}

function DemoContent() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="border-border bg-background/80 sticky top-0 z-10 border-b px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">@codecanon/next-presets</h1>
            <p className="text-muted-foreground text-xs">
              50+ shadcn theme presets, one click away
            </p>
          </div>
          <PresetDropdownPicker />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Color palette */}
        <DemoCard
          title="Color Palette"
          description="Core token colors change with each preset"
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <ColorSwatch label="Primary" variable="--primary" />
            <ColorSwatch label="Secondary" variable="--secondary" />
            <ColorSwatch label="Accent" variable="--accent" />
            <ColorSwatch label="Muted" variable="--muted" />
            <ColorSwatch label="Destructive" variable="--destructive" />
            <ColorSwatch label="Background" variable="--background" />
          </div>
        </DemoCard>

        {/* Sidebar palette */}
        <DemoCard
          title="Sidebar Palette"
          description="Sidebar-specific tokens for navigation components"
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <ColorSwatch label="Sidebar" variable="--sidebar" />
            <ColorSwatch label="Sidebar Primary" variable="--sidebar-primary" />
            <ColorSwatch label="Sidebar Accent" variable="--sidebar-accent" />
            <ColorSwatch label="Sidebar Border" variable="--sidebar-border" />
            <ColorSwatch label="Sidebar Ring" variable="--sidebar-ring" />
            <ColorSwatch label="Sidebar FG" variable="--sidebar-foreground" />
          </div>
        </DemoCard>

        {/* Chart colors */}
        <DemoCard title="Chart Colors" description="Data visualization palette">
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <ColorSwatch
                key={i}
                label={`Chart ${i}`}
                variable={`--chart-${i}`}
              />
            ))}
          </div>
        </DemoCard>

        {/* Typography & buttons */}
        <DemoCard
          title="Typography & Controls"
          description="Text styles and interactive elements"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">Heading text</p>
              <p className="text-muted-foreground text-sm">
                Muted foreground for secondary content and descriptions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary text-primary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Primary
              </button>
              <button className="bg-secondary text-secondary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Secondary
              </button>
              <button className="border-border bg-background hover:bg-muted inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium">
                Outline
              </button>
              <button className="bg-destructive/10 text-destructive inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Destructive
              </button>
            </div>
          </div>
        </DemoCard>

        {/* Always Light Mode */}
        <div className="scheme-light">
          <DemoCard
            title="Always Light Mode"
            description={
              <>
                Adding{" "}
                <code className="bg-muted rounded-sm px-1">scheme-light</code>{" "}
                forces light mode even when in dark mode
              </>
            }
          >
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary text-primary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Primary
              </button>
              <button className="bg-secondary text-secondary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Secondary
              </button>
              <button className="border-border bg-background hover:bg-muted inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium">
                Outline
              </button>
              <button className="bg-destructive/10 text-destructive inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Destructive
              </button>
            </div>
          </DemoCard>
        </div>

        {/* Always Dark Mode */}
        <div className="scheme-dark">
          <DemoCard
            title="Always Dark Mode"
            description={
              <>
                Adding{" "}
                <code className="bg-muted rounded-sm px-1">scheme-dark</code>{" "}
                forces dark mode even when in dark mode
              </>
            }
          >
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary text-primary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Primary
              </button>
              <button className="bg-secondary text-secondary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Secondary
              </button>
              <button className="border-border bg-background hover:bg-muted inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium">
                Outline
              </button>
              <button className="bg-destructive/10 text-destructive inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium">
                Destructive
              </button>
            </div>
          </DemoCard>
        </div>

        {/* App preview */}
        <DemoCard
          title="App Layout Preview"
          description="How a sidebar + content layout looks with this preset"
        >
          <div className="border-border overflow-hidden rounded-lg border">
            {/* Fake window chrome */}
            <div className="border-border bg-muted/50 flex items-center gap-1.5 border-b px-3 py-2">
              <div className="bg-destructive/60 size-2.5 rounded-full" />
              <div className="bg-muted-foreground/30 size-2.5 rounded-full" />
              <div className="bg-muted-foreground/30 size-2.5 rounded-full" />
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="border-sidebar-border bg-sidebar flex w-36 flex-col gap-1 border-r p-2">
                <div className="mb-2 flex items-center gap-1.5 px-1">
                  <div className="bg-sidebar-primary size-4 rounded" />
                  <div className="bg-sidebar-foreground/40 h-2 w-16 rounded" />
                </div>
                {[
                  { w: "w-20", active: true },
                  { w: "w-16", active: false },
                  { w: "w-24", active: false },
                  { w: "w-14", active: false },
                ].map(({ w, active }, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                  >
                    <div
                      className={`size-3 rounded ${active ? "bg-sidebar-primary" : "bg-sidebar-foreground/20"}`}
                    />
                    <div
                      className={`h-1.5 rounded ${w} ${active ? "bg-sidebar-foreground/70" : "bg-sidebar-foreground/25"}`}
                    />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="bg-background flex flex-1 flex-col">
                {/* Topbar */}
                <div className="border-border flex items-center justify-between border-b px-4 py-2">
                  <div className="bg-muted h-2 w-24 rounded" />
                  <div className="bg-primary h-6 w-16 rounded-md" />
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border-border bg-card rounded-lg border p-2"
                      >
                        <div className="bg-card-foreground/40 mb-1.5 h-2 w-3/4 rounded" />
                        <div className="bg-muted-foreground/30 h-1.5 w-1/2 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border-border bg-card flex items-center gap-2 rounded-md border px-3 py-2"
                      >
                        <div className="bg-primary/60 size-3 rounded-full" />
                        <div className="bg-muted h-1.5 flex-1 rounded" />
                        <div className="bg-accent h-1.5 w-8 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DemoCard>

        {/* How to use */}
        <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border px-5 py-4 text-sm">
          <strong className="text-foreground">Usage:</strong> Click{" "}
          <strong className="text-foreground">the preset button</strong> in the
          header to open the theme picker and browse 50+ presets. Your selection
          persists via localStorage.
        </div>
      </main>
    </div>
  )
}

const CUSTOM_PRESETS: PresetTuple[] = [["brown", "Brown"], ...PRESETS]

function App() {
  return (
    <ThemeProvider
      storageKey="next-presets-plaground-theme"
      defaultTheme="system"
    >
      <PresetProvider
        storageKey="next-presets-plaground-preset"
        presets={CUSTOM_PRESETS}
      >
        <DemoContent />
        <PresetPicker
          size="icon-lg"
          className="fixed right-4 bottom-4 size-11 rounded-full"
        >
          <Palette className="size-5" />
        </PresetPicker>
      </PresetProvider>
    </ThemeProvider>
  )
}

export { App }

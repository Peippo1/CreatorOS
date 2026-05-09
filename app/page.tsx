import {
  ArrowRightIcon,
  BrainCircuitIcon,
  FileTextIcon,
  Layers3Icon,
  LineChartIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const workflow = [
  {
    title: "Transcript/Input",
    description: "Drop in raw thinking, calls, scripts, or field notes.",
    icon: FileTextIcon,
  },
  {
    title: "Audience Intelligence",
    description: "Extract pains, motives, language, objections, and content gaps.",
    icon: BrainCircuitIcon,
  },
  {
    title: "Content Strategy",
    description: "Turn audience signal into positioning, hooks, and testable bets.",
    icon: LineChartIcon,
  },
  {
    title: "Strategic Repurposing",
    description: "Adapt the strongest angles into platform-native assets.",
    icon: Layers3Icon,
  },
  {
    title: "Creator Growth Pack",
    description: "Ship audience insight, content gaps, and growth experiments.",
    icon: SparklesIcon,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md border bg-card text-sm font-semibold">
            C
          </div>
          <span className="text-sm font-semibold tracking-tight">CreatorOS</span>
        </Link>
        <Button asChild size="sm">
          <Link href="/generate">
            Build Growth Pack
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </header>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-20 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h1 className="text-balance max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              CreatorOS
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Convert creator source material into audience intelligence,
              content gap discovery, platform-aware experiments, and strategic
              repurposing.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/generate">
                Build Growth Pack
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#workflow">View workflow</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-xl bg-primary/5" />
          <div className="grid-pattern overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b bg-card/90 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-foreground/20" />
                  <span className="size-2 rounded-full bg-foreground/20" />
                  <span className="size-2 rounded-full bg-foreground/20" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  creator-growth-pack.json
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Audience Signal
                </p>
                <p className="mt-3 text-sm leading-6">
                  The source material points to a strategy gap: creators need
                  sharper audience signal before they need more post ideas.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Content gaps",
                  "Hook hypotheses",
                  "Platform angles",
                  "Growth experiments",
                ].map((item) => (
                    <div key={item} className="rounded-lg border bg-background p-4">
                      <p className="text-sm font-medium">{item}</p>
                      <div className="mt-4 flex flex-col gap-2">
                        <span className="h-2 rounded-full bg-muted" />
                        <span className="h-2 w-4/5 rounded-full bg-muted" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-t bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">
              Three specialised agents beat one generic prompt.
            </h2>
            <p className="text-muted-foreground">
              Generic prompting blends diagnosis, strategy, and production into
              one blurry answer. CreatorOS separates those jobs so each output
              carries audience rationale, platform intent, and a testable next
              move.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {workflow.map((step, index) => {
              const Icon = step.icon;

              return (
                <Card key={step.title} className="relative min-h-56">
                  <CardHeader>
                    <div className="flex size-9 items-center justify-center rounded-md border bg-background">
                      <Icon className="size-4" />
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="font-mono text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import {
  BeakerIcon,
  CheckIcon,
  ClapperboardIcon,
  CompassIcon,
  CopyIcon,
  DownloadIcon,
  LightbulbIcon,
  MessageSquareQuoteIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CreatorGrowthPack } from "@/lib/types/generation";

type GrowthPackOutputProps = {
  growthPack: CreatorGrowthPack;
};

export function GrowthPackOutput({ growthPack }: GrowthPackOutputProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Creator Growth Pack</CardTitle>
            <CardDescription>
              Audience signal, content gaps, platform strategy, and testable
              growth bets.
            </CardDescription>
          </div>
          <Badge variant={growthPack.meta.usedMockData ? "secondary" : "outline"}>
            {growthPack.meta.usedMockData ? "Mock output" : growthPack.meta.model}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <CopyAllButton growthPack={growthPack} />
          <ExportMarkdownButton growthPack={growthPack} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ListSection
          title="Audience Insights"
          icon={UsersIcon}
          items={growthPack.audienceInsights}
        />
        <StructuredSection
          title="Content Gaps"
          icon={CompassIcon}
          items={growthPack.contentGaps.map((contentGap) => ({
            label: contentGap.gap,
            title: contentGap.whyItMatters,
            description: contentGap.suggestedExperiment,
          }))}
        />
        <ListSection
          title="Hook Hypotheses"
          icon={MessageSquareQuoteIcon}
          items={growthPack.viralHooks}
        />
        <ListSection
          title="Strategic Titles"
          icon={PenLineIcon}
          items={growthPack.titles}
        />
        <StructuredSection
          title="Platform Angles"
          icon={ClapperboardIcon}
          items={growthPack.shortFormIdeas.map((item) => ({
            label: item.format,
            title: item.idea,
            description: item.angle,
          }))}
        />
        <StructuredSection
          title="Strategic Repurposing"
          icon={LightbulbIcon}
          items={growthPack.repurposedContent.map((item) => ({
            label: item.format,
            title: item.content,
          }))}
        />
        <ListSection
          title="Growth Experiments"
          icon={BeakerIcon}
          items={growthPack.growthExperiments}
        />
      </CardContent>
    </Card>
  );
}

function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently skip
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </button>
  );
}

function CopyAllButton({ growthPack }: { growthPack: CreatorGrowthPack }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAsMarkdown(growthPack));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <CopyIcon data-icon="inline-start" />
      )}
      {copied ? "Copied!" : "Copy all"}
    </Button>
  );
}

function ExportMarkdownButton({ growthPack }: { growthPack: CreatorGrowthPack }) {
  function handleExport() {
    const md = formatAsMarkdown(growthPack);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator-growth-pack.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <DownloadIcon data-icon="inline-start" />
      Export .md
    </Button>
  );
}

function ListSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md border bg-card">
            <Icon className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <CopyButton text={items.map((item) => `- ${item}`).join("\n")} />
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StructuredSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Array<{
    label: string;
    title: string;
    description?: string;
  }>;
}) {
  const sectionText = items
    .map((item) =>
      [item.label, item.title, item.description].filter(Boolean).join("\n"),
    )
    .join("\n\n");

  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md border bg-card">
            <Icon className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <CopyButton text={sectionText} />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <article key={`${item.label}-${item.title}`} className="rounded-md border bg-card p-4">
            <Badge
              variant="secondary"
              className="max-w-full whitespace-normal text-left"
            >
              {item.label}
            </Badge>
            <p className="mt-3 text-sm leading-6">{item.title}</p>
            {item.description ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function formatAsMarkdown(pack: CreatorGrowthPack): string {
  const lines: string[] = ["# Creator Growth Pack", ""];

  lines.push("## Audience Insights", "");
  for (const insight of pack.audienceInsights) {
    lines.push(`- ${insight}`);
  }
  lines.push("");

  lines.push("## Content Gaps", "");
  for (const gap of pack.contentGaps) {
    lines.push(`### ${gap.gap}`, "");
    lines.push(`**Why it matters:** ${gap.whyItMatters}`, "");
    lines.push(`**Suggested experiment:** ${gap.suggestedExperiment}`, "");
  }

  lines.push("## Hook Hypotheses", "");
  for (const hook of pack.viralHooks) {
    lines.push(`- ${hook}`);
  }
  lines.push("");

  lines.push("## Strategic Titles", "");
  for (const title of pack.titles) {
    lines.push(`- ${title}`);
  }
  lines.push("");

  lines.push("## Platform Angles", "");
  for (const idea of pack.shortFormIdeas) {
    lines.push(`### ${idea.format}`, "");
    lines.push(idea.idea, "");
    lines.push(`*${idea.angle}*`, "");
  }

  lines.push("## Strategic Repurposing", "");
  for (const content of pack.repurposedContent) {
    lines.push(`### ${content.format}`, "");
    lines.push(content.content, "");
  }

  lines.push("## Growth Experiments", "");
  for (const exp of pack.growthExperiments) {
    lines.push(`- ${exp}`);
  }
  lines.push("");

  const modelLabel = pack.meta.usedMockData ? "Mock output" : pack.meta.model;
  lines.push("---", `*Generated by CreatorOS · ${modelLabel}*`);

  return lines.join("\n");
}

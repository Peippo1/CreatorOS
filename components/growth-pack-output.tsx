import {
  BeakerIcon,
  ClapperboardIcon,
  CompassIcon,
  LightbulbIcon,
  MessageSquareQuoteIcon,
  PenLineIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
              Audience signal, platform strategy, and testable growth bets.
            </CardDescription>
          </div>
          <Badge variant={growthPack.meta.usedMockData ? "secondary" : "outline"}>
            {growthPack.meta.usedMockData ? "Mock output" : growthPack.meta.model}
          </Badge>
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
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md border bg-card">
          <Icon className="size-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
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
  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md border bg-card">
          <Icon className="size-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
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

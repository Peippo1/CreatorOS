"use client";

import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useState } from "react";

import { GrowthPackOutput } from "@/components/growth-pack-output";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { CreatorGrowthPack, TargetPlatform } from "@/lib/types/generation";

const platforms: TargetPlatform[] = [
  "LinkedIn",
  "X",
  "TikTok",
  "Instagram",
  "YouTube Shorts",
  "Newsletter",
];

const sampleTranscript =
  "Most creators are not short on ideas. They are short on a reliable system for turning raw thinking into audience-specific content. The best creator teams treat every transcript, call, and voice note as source material. First they identify the audience tension, then they shape the content strategy, then they repurpose the strongest angles into platform-native assets.";

type GenerateResponse =
  | {
      growthPack: CreatorGrowthPack;
      error?: never;
    }
  | {
      growthPack?: never;
      error: string;
    };

export function GenerateWorkspace() {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [creatorNiche, setCreatorNiche] = useState("Creator education");
  const [targetPlatform, setTargetPlatform] =
    useState<TargetPlatform>("LinkedIn");
  const [targetAudience, setTargetAudience] = useState(
    "solo creators building internet businesses",
  );
  const [growthPack, setGrowthPack] = useState<CreatorGrowthPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          creatorNiche,
          targetPlatform,
          targetAudience,
        }),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || "error" in data) {
        throw new Error(data.error ?? "CreatorOS could not generate a pack.");
      }

      setGrowthPack(data.growthPack);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "CreatorOS could not generate a pack.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Source material</CardTitle>
          <CardDescription>
            The MVP accepts one rich input and routes it through the three-agent
            workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="Paste a transcript, notes, or raw creator idea..."
                rows={10}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="creator-niche">Creator niche</Label>
                <Input
                  id="creator-niche"
                  value={creatorNiche}
                  onChange={(event) => setCreatorNiche(event.target.value)}
                  placeholder="Creator education"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="target-platform">Target platform</Label>
                <Select
                  value={targetPlatform}
                  onValueChange={(value) =>
                    setTargetPlatform(value as TargetPlatform)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="target-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="target-audience">Target audience</Label>
              <Input
                id="target-audience"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                placeholder="Solo creators building internet businesses"
                disabled={isLoading}
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Generation failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : (
                <SparklesIcon data-icon="inline-start" />
              )}
              {isLoading ? "Generating" : "Generate Growth Pack"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="min-h-[42rem]">
        {isLoading ? <GrowthPackSkeleton /> : null}
        {!isLoading && growthPack ? (
          <GrowthPackOutput growthPack={growthPack} />
        ) : null}
        {!isLoading && !growthPack ? (
          <Card className="min-h-[42rem] justify-center border-dashed bg-card/70">
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-md border bg-background">
                <SparklesIcon className="size-5" />
              </div>
              <div className="flex max-w-md flex-col gap-2">
                <h2 className="text-xl font-semibold">Growth Pack preview</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  The generated output will appear here with audience insights,
                  hooks, titles, short-form ideas, repurposed assets, and growth
                  experiments.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function GrowthPackSkeleton() {
  return (
    <Card className="min-h-[42rem]">
      <CardHeader>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

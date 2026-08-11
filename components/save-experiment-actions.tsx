"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ContentExperiment } from "@/lib/types/product";

type ExperimentKind =
  | "content_gap"
  | "hook"
  | "title"
  | "platform_angle"
  | "repurposed_content"
  | "growth_experiment";

type SaveExperimentActionsProps = {
  kind: ExperimentKind;
  index: number;
  item: Record<string, string>;
  generationId: string;
  audienceSegment: string;
  audienceProblem: string;
  platform: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "duplicate" | "error";

export function SaveExperimentActions({
  kind,
  index,
  item,
  generationId,
  audienceSegment,
  audienceProblem,
  platform,
}: SaveExperimentActionsProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const [nextVariant, setNextVariant] = useState(2);

  async function save(variantLabel: string) {
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/experiments/from-growth-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          item,
          sourceReference: `Growth Pack ${generationId}`,
          sourceItemKey: `${generationId}:${kind}:${index}`,
          audienceSegment,
          audienceProblem,
          platform,
          variantLabel,
        }),
      });
      const data = await response.json() as { experiment?: ContentExperiment; error?: string };

      if (response.status === 409) {
        setStatus("duplicate");
        setMessage("Already saved. Create a variant to save another test.");
        return;
      }
      if (!response.ok || !data.experiment) {
        setStatus("error");
        setMessage(data.error ?? "Could not save this experiment.");
        return;
      }

      setStatus("saved");
      setMessage(`${variantLabel} saved to the experiment queue.`);
      if (variantLabel !== "Original") setNextVariant((value) => value + 1);
    } catch {
      setStatus("error");
      setMessage("Could not save this experiment. Please try again.");
    }
  }

  const isSaving = status === "saving";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" disabled={isSaving} onClick={() => void save("Original")}>
        {isSaving ? "Saving…" : status === "saved" ? "Saved" : "Save as experiment"}
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={isSaving} onClick={() => void save(`Variant ${nextVariant}`)}>
        Create variant
      </Button>
      {message ? <span aria-live="polite" className={`text-xs ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message}</span> : null}
    </div>
  );
}

import { describe, expect, it } from "vitest";

import { parsePerformanceCsv } from "@/lib/metrics/csv";
import { analysePerformance } from "@/lib/learning/analyse";
import type { ContentExperiment, PerformanceSnapshot } from "@/lib/types/product";

const experiment = (id: string, title: string): ContentExperiment => ({
  id, title, platform: "YouTube", format: "Video", audienceSegment: "Coaches", audienceProblem: "Consistency", hook: "A useful hook", cta: "Join", intendedOutcome: "Signups", hypothesis: "Specific hooks earn more signups", draft: "", variantLabel: "Original", status: "published", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("CreatorOS product loop", () => {
  it("parses valid CSV rows and reports malformed rows", () => {
    const result = parsePerformanceCsv(`experiment_id,published_at,views,clicks,signups\n123e4567-e89b-12d3-a456-426614174000,2026-01-01,100,10,2\n123e4567-e89b-12d3-a456-426614174000,not-a-date,broken,0,0`);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].signups).toBe(2);
    expect(result.errors[0]).toContain("Row 3");
  });

  it("turns outcomes into deterministic next-experiment advice", () => {
    const snapshots: PerformanceSnapshot[] = [{ experimentId: "a", publishedAt: "2026-01-01", views: 100, likes: 10, comments: 2, shares: 1, saves: 1, clicks: 8, signups: 3, revenue: 0, qualifiedLeads: 0, watchTimeMinutes: null, id: "m", createdAt: "2026-01-02" }];
    const insights = analysePerformance([experiment("a", "The winning test")], snapshots);
    expect(insights[0].title).toBe("Your strongest signal is Video on YouTube");
    expect(insights[0].recommendation).toContain("same Video");
  });
});

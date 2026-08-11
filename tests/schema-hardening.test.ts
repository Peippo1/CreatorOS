import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("database hardening migration", () => {
  const schema = readFileSync("supabase/schema.sql", "utf8");

  it("contains ownership and duplicate-outcome protections", () => {
    expect(schema).toContain("content_experiments_source_owner_fkey");
    expect(schema).toContain("performance_snapshots_user_experiment_published_key");
    expect(schema).toContain("content_experiments_valid_status");
    expect(schema).toContain("performance_snapshots_nonnegative_metrics");
  });
});

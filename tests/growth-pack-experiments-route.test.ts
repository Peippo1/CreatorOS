import { beforeEach, describe, expect, it, vi } from "vitest";

const requireViewer = vi.hoisted(() => vi.fn());
const recordBetaEvent = vi.hoisted(() => vi.fn());
const listExperiments = vi.hoisted(() => vi.fn());
const addExperiment = vi.hoisted(() => vi.fn());
const getStore = vi.hoisted(() => vi.fn(() => ({ listExperiments, addExperiment })));

vi.mock("@/lib/api/auth", () => ({ requireViewer }));
vi.mock("@/lib/analytics/events", () => ({ recordBetaEvent }));
vi.mock("@/lib/storage", () => ({ getStore }));

import { POST } from "@/app/api/experiments/from-growth-pack/route";

const validBody = {
  kind: "growth_experiment",
  item: { value: "Test a weekly planning walkthrough" },
  sourceReference: "Growth Pack generation-1",
  sourceItemKey: "generation-1:growth_experiment:0",
  audienceSegment: "solo creators",
  audienceProblem: "inconsistent publishing",
  platform: "LinkedIn",
  cta: "Join the newsletter",
  intendedOutcome: "Learn which angle earns signups",
  variantLabel: "Original",
};

function request(body: unknown) {
  return new Request("https://creator.example.com/api/experiments/from-growth-pack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/experiments/from-growth-pack", () => {
  beforeEach(() => vi.clearAllMocks());
  it("persists an owned experiment and records a distinct beta event", async () => {
    requireViewer.mockResolvedValue({ viewer: { id: "user-1" }, response: null });
    listExperiments.mockResolvedValue([]);
    addExperiment.mockResolvedValue({ id: "experiment-1", status: "idea", ...validBody });

    const response = await POST(request(validBody));

    expect(response.status).toBe(201);
    expect(addExperiment).toHaveBeenCalledWith("user-1", expect.objectContaining({
      hypothesis: "Test a weekly planning walkthrough",
      audienceSegment: "solo creators",
      sourceItemKey: "generation-1:growth_experiment:0",
    }));
    expect(recordBetaEvent).toHaveBeenCalledWith("user-1", "experiment_created_from_growth_pack");
  });

  it("rejects the same item and variant without overwriting the original", async () => {
    requireViewer.mockResolvedValue({ viewer: { id: "user-1" }, response: null });
    listExperiments.mockResolvedValue([{
      id: "existing",
      sourceItemKey: validBody.sourceItemKey,
      variantLabel: "Original",
    }]);

    const response = await POST(request(validBody));

    expect(response.status).toBe(409);
    expect(addExperiment).not.toHaveBeenCalled();
    expect(recordBetaEvent).not.toHaveBeenCalled();
  });

  it("allows an intentional second variant", async () => {
    requireViewer.mockResolvedValue({ viewer: { id: "user-1" }, response: null });
    listExperiments.mockResolvedValue([{
      id: "existing",
      sourceItemKey: validBody.sourceItemKey,
      variantLabel: "Original",
    }]);
    addExperiment.mockResolvedValue({ id: "variant-1", status: "idea", ...validBody, variantLabel: "Variant 2" });

    const response = await POST(request({ ...validBody, variantLabel: "Variant 2" }));

    expect(response.status).toBe(201);
    expect(addExperiment).toHaveBeenCalledWith("user-1", expect.objectContaining({ variantLabel: "Variant 2" }));
  });

  it("rejects invalid generated data before persistence", async () => {
    requireViewer.mockResolvedValue({ viewer: { id: "user-1" }, response: null });

    const response = await POST(request({ ...validBody, item: { value: "" } }));

    expect(response.status).toBe(400);
    expect(addExperiment).not.toHaveBeenCalled();
  });
});

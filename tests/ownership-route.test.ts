import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSource: vi.fn(),
  addExperiment: vi.fn(),
  requireViewer: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({ requireViewer: mocks.requireViewer }));
vi.mock("@/lib/storage", () => ({
  getStore: () => ({ getSource: mocks.getSource, addExperiment: mocks.addExperiment }),
}));
vi.mock("@/lib/analytics/events", () => ({ recordBetaEvent: vi.fn() }));

import { POST as createExperiment } from "@/app/api/experiments/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireViewer.mockResolvedValue({ viewer: { id: "user-a", email: "a@example.com", demo: false }, response: null });
});

describe("experiment ownership boundaries", () => {
  it("rejects a source that is not owned by the authenticated user", async () => {
    mocks.getSource.mockResolvedValue(null);

    const response = await createExperiment(new Request("https://creator.example/api/experiments", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://creator.example" },
      body: JSON.stringify({
        sourceDocumentId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test",
        platform: "YouTube",
        format: "Video",
      }),
    }));

    expect(response.status).toBe(404);
    expect(mocks.addExperiment).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON instead of throwing", async () => {
    const response = await createExperiment(new Request("https://creator.example/api/experiments", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://creator.example" },
      body: "{",
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Malformed JSON request." });
  });
});

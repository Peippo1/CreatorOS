import { DEFAULT_OPENAI_MODEL } from "@/lib/openai/config";
import type { CreatorGrowthPack, GenerateInput } from "@/lib/types/generation";

export function createMockGrowthPack(input: GenerateInput): CreatorGrowthPack {
  const platform = input.targetPlatform;
  const audience = input.targetAudience.toLowerCase();

  return {
    audienceInsights: [
      `${audience} do not need another list of tactics. They need a way to diagnose why their current content is not creating demand.`,
      `The strongest tension is the gap between idea quality and audience signal: creators can sound smart while still missing the objection the audience cares about.`,
      `Content gap: the source explains the workflow, but it should also show what changes when audience intelligence comes before repurposing.`,
      `The message should resonate because it reframes content production as a strategy problem, not a posting-volume problem.`,
      `Use language around signal, gaps, objections, and experiments because it gives ${audience} a more precise job to hire CreatorOS for.`,
    ],
    contentGaps: [
      {
        gap: "Audience diagnosis before asset production",
        whyItMatters:
          "The source says creators need a system, but the audience needs to see why diagnosis changes the quality of every downstream asset.",
        suggestedExperiment: `Publish a ${platform} post comparing a generic repurposing workflow with an audience-intelligence-first workflow and track saves plus qualified replies.`,
      },
      {
        gap: "Proof that content gaps are discoverable from messy source material",
        whyItMatters:
          "Creators may agree with the strategy but doubt that transcripts and notes can reveal useful audience objections.",
        suggestedExperiment:
          "Share one anonymized transcript excerpt, extract three audience gaps from it, and ask readers which gap feels most commercially urgent.",
      },
      {
        gap: "Platform behavior tied to strategic intent",
        whyItMatters:
          "The audience needs to understand that a strong idea should be shaped differently depending on whether the goal is replies, saves, shares, or clicks.",
        suggestedExperiment: `Run two ${platform} variants from the same insight: one optimized for replies and one optimized for saves. Compare the dominant engagement signal after 48 hours.`,
      },
    ],
    viralHooks: [
      `Most ${input.creatorNiche} creators do not have a content problem. They have an audience signal problem.`,
      `If your posts are accurate but ignored, you may be answering the wrong audience question.`,
      `Repurposing without audience intelligence just multiplies weak positioning.`,
      `Before you turn one idea into ten assets, find the content gap the audience already feels.`,
      `The best ${platform} ideas start with a testable audience hypothesis, not a blank page.`,
    ],
    titles: [
      `Audience Intelligence Before Repurposing: A Better Creator Workflow`,
      `How ${input.creatorNiche} Creators Find the Content Gaps Their Audience Feels`,
      `From Raw Transcript to Platform-Aware Growth Strategy`,
      `A Practical Growth Pack for ${input.targetAudience}`,
      `Why Strong Creator Content Starts With Audience Diagnosis`,
    ],
    shortFormIdeas: [
      {
        format: `${platform} hypothesis post`,
        idea: "State the hypothesis that low engagement often comes from weak audience diagnosis, then show the three questions CreatorOS asks before repurposing.",
        angle: "Resonates because it names the hidden failure mode behind flat content.",
      },
      {
        format: "Content gap breakdown",
        idea: "Compare a generic post angle with a gap-led angle that handles a specific objection from the audience.",
        angle: "Makes the value of audience intelligence visible instead of abstract.",
      },
      {
        format: "Before/after workflow",
        idea: "Show how one transcript becomes audience insight, hook hypothesis, platform angle, and a measurable experiment.",
        angle: "Demonstrates strategic repurposing without promising automatic growth.",
      },
    ],
    repurposedContent: [
      {
        format: `${platform} strategy post`,
        content:
          "Most creators turn one idea into more posts. The sharper move is to turn one source into audience intelligence first: what does the audience believe, what objection is blocking them, and what content gap has not been answered yet?",
      },
      {
        format: "Newsletter strategy note",
        content:
          "This week I am testing a stricter content workflow: no repurposing until the audience tension is clear. The goal is not more assets. It is better strategic fit between the idea, the platform, and the belief the audience needs to adopt.",
      },
      {
        format: "Short-form diagnostic script",
        content:
          "If your content is useful but not moving, ask three questions: what objection does this handle, what content gap does it fill, and what platform behavior are we trying to earn?",
      },
      {
        format: "Content gap prompt",
        content:
          "What does your audience already know, what do they still misunderstand, and what proof would make them act this week? Use the answers before writing the next post.",
      },
    ],
    growthExperiments: [
      `Run a three-hook test on ${platform}: one pain-led hook, one objection-led hook, and one content-gap hook. Compare replies, saves, and profile clicks after 48 hours.`,
      "Publish one diagnostic post that asks the audience to choose their biggest blocker. Use the top reply as the next content gap brief.",
      "Turn the same transcript into two assets only: one strategy post and one short diagnostic script. Compare which creates more qualified replies.",
      "Test a before/after framing that shows raw idea versus audience-intelligence-led output. Track comments that mention clarity, relevance, or timing.",
      "Ask the audience which title feels most urgent, then publish the winning angle with a specific objection addressed in the first third.",
    ],
    meta: {
      model: DEFAULT_OPENAI_MODEL,
      usedMockData: true,
    },
  };
}

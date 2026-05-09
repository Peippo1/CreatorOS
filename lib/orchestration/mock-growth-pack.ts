import { DEFAULT_OPENAI_MODEL } from "@/lib/openai/config";
import type { CreatorGrowthPack, GenerateInput } from "@/lib/types/generation";

export function createMockGrowthPack(input: GenerateInput): CreatorGrowthPack {
  const platform = input.targetPlatform;
  const audience = input.targetAudience.toLowerCase();

  return {
    audienceInsights: [
      `${input.creatorNiche} buyers want a clear point of view, not broad education.`,
      `The strongest angle is helping ${audience} move from passive learning to visible execution.`,
      `The transcript can be framed as a before-and-after operating system for creator growth.`,
      `Use direct language that names the cost of inconsistency and unclear positioning.`,
    ],
    viralHooks: [
      `Most ${input.creatorNiche} creators do not have a content problem. They have a signal problem.`,
      `Your transcript is not content. It is a growth system waiting to be packaged.`,
      `If your ideas are strong but your posts are flat, this is the missing layer.`,
      `The fastest way to grow on ${platform}: turn one idea into five audience-specific assets.`,
      `Stop asking what to post. Start asking what your audience needs to believe next.`,
    ],
    titles: [
      `The CreatorOS Method for Turning One Transcript Into a Growth Pack`,
      `How ${input.creatorNiche} Creators Can Build a Repeatable Content Engine`,
      `From Raw Ideas to Platform-Native Content in One Workflow`,
      `A Practical Content System for ${input.targetAudience}`,
      `The Operating System Behind Consistent Creator Growth`,
    ],
    shortFormIdeas: [
      {
        format: "Contrarian opener",
        idea: "Open with the claim that creators do not need more ideas; they need better orchestration.",
        angle: "Problem reframing",
      },
      {
        format: "Three-step breakdown",
        idea: "Show Transcript, Audience Intelligence, Strategy, and Repurposing as a repeatable loop.",
        angle: "Workflow clarity",
      },
      {
        format: "Before/after post",
        idea: "Contrast a raw transcript with the final Creator Growth Pack assets.",
        angle: "Transformation proof",
      },
    ],
    repurposedContent: [
      {
        format: `${platform} post`,
        content:
          "Most creators turn one idea into one post. The better move is to turn one source into audience insights, hooks, titles, short-form ideas, repurposed assets, and growth experiments.",
      },
      {
        format: "Newsletter intro",
        content:
          "This week I tested a sharper way to think about content: not as individual posts, but as an operating system that converts raw thinking into reusable growth assets.",
      },
      {
        format: "Short-form script",
        content:
          "You do not need to start from a blank page. Start with a transcript. Extract the audience tension. Build the strategy. Then repurpose the strongest angles into platform-native assets.",
      },
    ],
    growthExperiments: [
      `Publish three hooks on ${platform} with the same core idea and compare saves, replies, and profile clicks.`,
      "Turn the strongest audience pain point into a recurring weekly content pillar.",
      "Repurpose the same transcript into a text post, short video script, and newsletter section.",
      "Ask the audience which title feels most urgent, then use the winner as the next content brief.",
    ],
    meta: {
      model: DEFAULT_OPENAI_MODEL,
      usedMockData: true,
    },
  };
}

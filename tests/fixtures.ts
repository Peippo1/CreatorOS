import type { GenerateInput } from "@/lib/types/generation";

export const validGenerateInput: GenerateInput = {
  transcript:
    "Most creators are not short on ideas. They are short on audience signal. Their content often explains what they know, but it does not always answer the exact objection, urgency, or language their audience is already carrying. The best creator teams treat every transcript, call, and voice note as research.",
  creatorNiche: "Creator education",
  targetPlatform: "LinkedIn",
  targetAudience: "solo creators building internet businesses",
};

export const technicalFounderFixture: GenerateInput = {
  transcript:
    "Technical founders sell better when they explain the production risk their product removes. Engineering leaders care less about feature depth than about incident prevention, evaluation confidence, and whether the tool adds maintenance burden. The strongest LinkedIn posts compare a failing workflow with the safer workflow the product creates.",
  creatorNiche: "AI infrastructure and developer tooling",
  targetPlatform: "LinkedIn",
  targetAudience: "technical founders selling to engineering leaders",
};

export const fitnessFixture: GenerateInput = {
  transcript:
    "Busy professionals coming back to training need a plan that respects time, embarrassment, and restart friction. The best content normalizes starting over without making the plan feel soft. Progress should be framed as a minimum effective week, realistic progression, and a routine the audience can repeat after a long workday.",
  creatorNiche: "Strength training for busy professionals",
  targetPlatform: "Instagram",
  targetAudience: "busy professionals returning to training after years away",
};

export const educationalYoutubeFixture: GenerateInput = {
  transcript:
    "History content works best on YouTube Shorts when the hook starts with consequence, not background. Curious viewers stay when the lesson opens with tension, surprise, or a human decision with stakes. The channel should translate accuracy into a story engine that earns retention in the first three seconds.",
  creatorNiche: "History education on YouTube",
  targetPlatform: "YouTube Shorts",
  targetAudience: "curious adults who like deep history but avoid academic lectures",
};

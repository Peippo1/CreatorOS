import { DEFAULT_OPENAI_MODEL } from "@/lib/openai/config";
import type {
  CreatorGrowthPack,
  GenerateInput,
  TargetPlatform,
} from "@/lib/types/generation";

type DemoMode =
  | "technical_founder"
  | "fitness_creator"
  | "educational_youtube"
  | "general";

type MockProfile = {
  audienceInsightLead: string;
  contentGapLead: string;
  resonanceLead: string;
  hookPrefix: string;
  titleLead: string;
  strategyPostLead: string;
  strategyNoteLead: string;
  diagnosticScriptLead: string;
  gapPromptLead: string;
  growthExperimentLead: string;
};

type PlatformFrame = {
  formatLead: string;
  rationale: string;
  experimentMetric: string;
};

type TopicFrame = {
  sourceSignal: string;
  sourceEvidence: string;
  primaryTension: string;
  primaryHook: string;
  audiencePsychology: string;
  resonanceFrame: string;
  languageSignals: string;
  contentGapOne: string;
  contentGapOneWhy: string;
  contentGapOneExperiment: (
    platform: string,
    signal: string,
    metric: string,
  ) => string;
  contentGapTwo: string;
  contentGapTwoWhy: string;
  contentGapTwoExperiment: (
    platform: string,
    evidence: string,
    metric: string,
  ) => string;
  contentGapThree: string;
  contentGapThreeWhy: string;
  contentGapThreeExperiment: (
    platform: string,
    rationale: string,
    metric: string,
  ) => string;
  contentGapFour: string;
  contentGapFourWhy: string;
  contentGapFourExperiment: (
    platform: string,
    signal: string,
    metric: string,
  ) => string;
  hookOne: string;
  hookTwo: string;
  hookThree: string;
  hookFour: string;
  hookFive: string;
  titleOne: string;
  titleTwo: string;
  titleThree: string;
  titleFour: string;
  titleFive: string;
  shortIdeaOne: string;
  shortAngleOne: string;
  shortIdeaTwo: string;
  shortAngleTwo: string;
  shortIdeaThree: string;
  shortAngleThree: string;
  repurposedPost: string;
  repurposedNote: string;
  repurposedScript: string;
  repurposedPrompt: string;
  experimentOne: (platform: string, metric: string) => string;
  experimentTwo: (metric: string) => string;
  experimentThree: (platform: string, signal: string) => string;
  experimentFour: (rationale: string) => string;
  experimentFive: (platform: string, evidence: string) => string;
};

export function createMockGrowthPack(input: GenerateInput): CreatorGrowthPack {
  const mode = detectDemoMode(input);
  const profile = getProfile(mode);
  const topic = inferTopic(input.transcript, mode);
  const platformFrame = getPlatformFrame(input.targetPlatform);
  const audience = input.targetAudience.toLowerCase();

  return {
    audienceInsights: [
      `${input.targetAudience} do not need another list of tactics. They need a way to diagnose why their current content is not creating demand around ${topic.sourceSignal}.`,
      `${profile.audienceInsightLead} The transcript points to ${topic.sourceEvidence} and ${topic.primaryTension}.`,
      `The strongest angle is to connect ${topic.primaryHook} with ${topic.audiencePsychology} on ${input.targetPlatform}.`,
      `The message should resonate because it reframes ${topic.resonanceFrame} into ${platformFrame.rationale}, which fits ${profile.resonanceLead}.`,
      `Use language around ${topic.languageSignals} because it gives ${audience} a more precise reason to trust CreatorOS.`,
    ],
    contentGaps: [
      {
        gap: topic.contentGapOne,
        whyItMatters: `${profile.contentGapLead} ${topic.contentGapOneWhy}`,
        suggestedExperiment: topic.contentGapOneExperiment(
          input.targetPlatform,
          topic.sourceSignal,
          platformFrame.experimentMetric,
        ),
      },
      {
        gap: topic.contentGapTwo,
        whyItMatters: topic.contentGapTwoWhy,
        suggestedExperiment: topic.contentGapTwoExperiment(
          input.targetPlatform,
          topic.sourceEvidence,
          platformFrame.experimentMetric,
        ),
      },
      {
        gap: topic.contentGapThree,
        whyItMatters: topic.contentGapThreeWhy,
        suggestedExperiment: topic.contentGapThreeExperiment(
          input.targetPlatform,
          platformFrame.rationale,
          platformFrame.experimentMetric,
        ),
      },
      {
        gap: topic.contentGapFour,
        whyItMatters: topic.contentGapFourWhy,
        suggestedExperiment: topic.contentGapFourExperiment(
          input.targetPlatform,
          topic.sourceSignal,
          platformFrame.experimentMetric,
        ),
      },
    ],
    viralHooks: [
      `${profile.hookPrefix} ${topic.sourceSignal}.`,
      `${topic.hookTwo}.`,
      `${topic.hookThree}.`,
      `${topic.hookFour}.`,
      `${topic.hookFive} on ${input.targetPlatform}.`,
    ],
    titles: [
      `${profile.titleLead} ${topic.titleOne} for ${topic.sourceSignal}`,
      topic.titleTwo,
      topic.titleThree,
      topic.titleFour,
      topic.titleFive,
    ],
    shortFormIdeas: [
      {
        format: platformFrame.formatLead,
        idea: topic.shortIdeaOne,
        angle: `${topic.shortAngleOne} This works best when the frame is ${platformFrame.rationale}.`,
      },
      {
        format: "Content gap breakdown",
        idea: `${topic.shortIdeaTwo} Start from ${topic.sourceSignal} rather than generic motivation.`,
        angle: topic.shortAngleTwo,
      },
      {
        format: "Before/after workflow",
        idea: `${topic.shortIdeaThree} Use ${input.targetPlatform} to show the shift in one scan.`,
        angle: topic.shortAngleThree,
      },
    ],
    repurposedContent: [
      {
        format: `${input.targetPlatform} strategy post`,
        content: `${profile.strategyPostLead} ${topic.repurposedPost} The transcript keeps returning to ${topic.sourceEvidence}.`,
      },
      {
        format: "Newsletter strategy note",
        content: `${profile.strategyNoteLead} ${topic.repurposedNote} The platform angle is ${platformFrame.rationale}.`,
      },
      {
        format: "Short-form diagnostic script",
        content: `${profile.diagnosticScriptLead} ${topic.repurposedScript} Lead with ${topic.sourceSignal}.`,
      },
      {
        format: "Content gap prompt",
        content: `${profile.gapPromptLead} ${topic.repurposedPrompt} Keep the question tied to ${input.targetPlatform}.`,
      },
    ],
    growthExperiments: [
      `${profile.growthExperimentLead} ${topic.experimentOne(
        input.targetPlatform,
        platformFrame.experimentMetric,
      )}`,
      topic.experimentTwo(platformFrame.experimentMetric),
      topic.experimentThree(input.targetPlatform, topic.sourceSignal),
      topic.experimentFour(platformFrame.rationale),
      topic.experimentFive(input.targetPlatform, topic.sourceEvidence),
    ],
    meta: {
      model: DEFAULT_OPENAI_MODEL,
      usedMockData: true,
    },
  };
}

function detectDemoMode(input: GenerateInput): DemoMode {
  const text = `${input.creatorNiche} ${input.targetAudience} ${input.transcript}`.toLowerCase();

  if (
    /developer|engineering|sdk|infra|ai infrastructure|devtool|technical founder/.test(
      text,
    )
  ) {
    return "technical_founder";
  }

  if (/fitness|training|gym|workout|strength|nutrition|muscle|fat loss/.test(text)) {
    return "fitness_creator";
  }

  if (/youtube|history|education|lesson|explain|student|learn/.test(text)) {
    return "educational_youtube";
  }

  return "general";
}

function getProfile(mode: DemoMode): MockProfile {
  switch (mode) {
    case "technical_founder":
      return {
        audienceInsightLead:
          "Engineering buyers evaluate through risk, reliability, and production-readiness, not feature novelty.",
        contentGapLead:
          "A production-readiness gap appears because the content explains capability but not the failure mode it removes.",
        resonanceLead:
          "technical capability as operational risk reduction instead of feature breadth",
        hookPrefix: "Engineering leaders do not wake up wanting a new SDK",
        titleLead: "Demo-Ready Is Not Production-Ready:",
        strategyPostLead:
          "The buyer-ready angle is not feature depth. It is the incident this prevents.",
        strategyNoteLead:
          "This demo mode should help the founder narrate the operational problem before the capability.",
        diagnosticScriptLead:
          "Use the problem-first frame: risk, workflow, then feature.",
        gapPromptLead:
          "Ask what failure mode the audience already fears, what they need to believe about production, and what internal justification they need.",
        growthExperimentLead:
          "Test a failure-mode opener against a feature-led opener. Measure saves and qualified comments.",
      };
    case "fitness_creator":
      return {
        audienceInsightLead:
          "Busy adults returning to training care less about optimization and more about shame, decision load, and staying consistent when life gets noisy.",
        contentGapLead:
          "A confidence gap appears because the content should normalize restart friction while still making progress feel concrete.",
        resonanceLead:
          "returning-to-training psychology as a minimum-viable-plan problem",
        hookPrefix: "Most people returning to the gym do too much in week one",
        titleLead: "The Minimum Effective Plan for:",
        strategyPostLead:
          "The useful angle is not motivation. It is the plan that fits a messy calendar and lowers restart friction.",
        strategyNoteLead:
          "This demo mode should sound like a coach who understands shame, not a marketer pushing intensity.",
        diagnosticScriptLead:
          "Use the reset-frame: reduce decision load, normalize the restart, and define one measurable next step.",
        gapPromptLead:
          "Ask what makes restarting feel embarrassing, what decision friction keeps them stuck, and what proof of progress they need in week one.",
        growthExperimentLead:
          "Test a restart-led hook against an intensity-led hook. Compare saves, shares, and comments about realism.",
      };
    case "educational_youtube":
      return {
        audienceInsightLead:
          "Curious viewers stay when a lesson opens with tension and consequence, not with background or chronology.",
        contentGapLead:
          "A retention gap appears because the content needs to connect scholarly accuracy with a first-3-seconds story engine.",
        resonanceLead:
          "history education as a consequence-first storytelling problem",
        hookPrefix:
          "The strongest history videos start with the consequence, not the timeline",
        titleLead: "Consequence First:",
        strategyPostLead:
          "The better format is a hook that earns curiosity immediately, then earns the context.",
        strategyNoteLead:
          "This demo mode should read like an editor who cares about retention without sacrificing accuracy.",
        diagnosticScriptLead:
          "Use the hook-order frame: consequence, tension, context, then explanation.",
        gapPromptLead:
          "Ask what the viewer already finds surprising, what context is missing, and what story engine keeps them watching.",
        growthExperimentLead:
          "Test a consequence-first short against a background-first short. Compare retention and rewatches.",
      };
    case "general":
    default:
      return {
        audienceInsightLead:
          "The source material suggests a strategic gap: the audience needs clearer signal before more content volume.",
        contentGapLead:
          "A strategy gap appears because the transcript is describing work without yet proving the audience problem.",
        resonanceLead:
          "raw source material into audience-first strategy",
        hookPrefix: "Most creators do not have a content problem",
        titleLead: "Audience Intelligence Before Repurposing:",
        strategyPostLead:
          "The better angle is to start with diagnosis, then move to content production.",
        strategyNoteLead:
          "This demo mode should stay practical and avoid generic creator advice.",
        diagnosticScriptLead:
          "Use a three-step frame: audience tension, content gap, and testable next move.",
        gapPromptLead:
          "Ask what the audience is already trying to solve, what they still misunderstand, and which experiment would validate the angle.",
        growthExperimentLead:
          "Test a diagnostic post against a generic repurposing post. Compare comments and saves.",
      };
  }
}

function inferTopic(text: string, mode: DemoMode): TopicFrame {
  const source = analyzeSourceMaterial(text, mode);

  if (mode === "technical_founder") {
    return {
      ...source,
      primaryTension: "buyers want evidence of production readiness, not product novelty",
      primaryHook: "failure-mode-first messaging",
      audiencePsychology:
        "the fear of introducing operational risk through a new dependency",
      resonanceFrame: "feature messaging into risk reduction messaging",
      languageSignals: "risk, production, drift, deploy, incident, readiness, ownership",
      contentGapOne: "Failure-mode-first messaging",
      contentGapOneWhy:
        "Engineering leaders scan for the incident a tool prevents before they care about the capability itself.",
      contentGapOneExperiment: (platform: string, signal: string, metric: string) =>
        `Publish a ${platform} post that opens with ${signal} and compare ${metric} to a feature-led version.`,
      contentGapTwo: "Production-readiness criteria",
      contentGapTwoWhy:
        "A concrete readiness checklist helps the buyer judge whether the tool is safe enough to adopt.",
      contentGapTwoExperiment: (
        platform: string,
        evidence: string,
        metric: string,
      ) => `Create a ${platform} checklist that answers ${evidence} and track ${metric}.`,
      contentGapThree: "Before-and-after workflow proof",
      contentGapThreeWhy:
        "Workflow contrast reduces uncertainty because the buyer can see how day-to-day work changes.",
      contentGapThreeExperiment: (
        platform: string,
        rationale: string,
        metric: string,
      ) =>
        `Show a before/after workflow on ${platform} that makes ${rationale} visible and compare ${metric} against a launch post.`,
      contentGapFour: "Internal justification language",
      contentGapFourWhy:
        "Engineering leaders need words they can use to defend the decision internally.",
      contentGapFourExperiment: (
        platform: string,
        signal: string,
        metric: string,
      ) =>
        `Write a ${platform} post with internal-justification language around ${signal} and ask readers which line they would use with a CTO or platform team; compare ${metric}.`,
      hookOne: "Engineering leaders do not wake up wanting a new SDK",
      hookTwo:
        "If your launch post starts with what you support, the buyer has to translate the value themselves",
      hookThree: "Demo-ready is not production-ready",
      hookFour: "The real problem is hidden integration drift",
      hookFive: "Show the workflow before you show the feature",
      titleOne: "The Failure-Mode-First Positioning Playbook for Developer Tooling Founders",
      titleTwo: "Why Engineering Leaders Ignore Feature-Led Devtool Messaging",
      titleThree: "How to Explain an AI Infra Tool Without Sounding Like Another Dependency",
      titleFour: "Before-and-After Workflows: The Most Underused Content Format in AI Infrastructure",
      titleFive: "What Engineering Leaders Actually Need to Believe Before They Buy a New Tool",
      shortIdeaOne:
        "Open with the operational pain, then show why feature-first messaging forces the buyer to translate the risk themselves.",
      shortAngleOne:
        "Failure-mode-first messaging. This should resonate because it starts with the pain the buyer already recognizes.",
      shortIdeaTwo:
        "Build a carousel that compares demo-ready versus production-ready AI features and gives engineering leaders a saveable checklist tied to the failure mode they already fear.",
      shortAngleTwo:
        "Production-readiness framing. This gives the buyer language they can use internally before rollout.",
      shortIdeaThree:
        "Show a before-and-after workflow where drift, risk, and maintenance load become visible before the feature pitch appears, using the transcript's main warning as the entry point.",
      shortAngleThree:
        "Workflow proof. This makes the product feel like risk reduction instead of a shiny dependency.",
      repurposedPost:
        "Engineering leaders do not buy technical depth first. They buy fewer failed deploys, less hidden integration drift, and clearer production readiness.",
      repurposedNote:
        "A useful demo should show the incident it prevents before it shows the feature.",
      repurposedScript:
        "If a tool only looks good in a demo, the buyer still has to ask what breaks in production. Start with the failure mode, then show the workflow shift.",
      repurposedPrompt:
        "Which failure mode do your users already fear, and what production-readiness proof would make the feature feel safe enough to adopt?",
      experimentOne: (platform: string, metric: string) =>
        `Run a ${platform} failure-mode opener against a feature-led opener and compare ${metric}.`,
      experimentTwo: (metric: string) =>
        `Publish a production-readiness checklist and ask readers which check they are missing today; compare ${metric}.`,
      experimentThree: (platform: string, signal: string) =>
        `Write a before/after workflow post on ${platform} that starts with ${signal} and compare profile visits against a normal launch post.`,
      experimentFour: (rationale: string) =>
        `Test an objection-led post about maintenance burden and show how ${rationale}; measure comment quality.`,
      experimentFive: (platform: string, evidence: string) =>
        `Rewrite one feature announcement into an internal-justification post on ${platform} using ${evidence} and compare replies.`,
    };
  }

  if (mode === "fitness_creator") {
    return {
      ...source,
      primaryTension:
        "returning to training is more about restart friction than optimization",
      primaryHook: "restart-friendly fitness messaging",
      audiencePsychology:
        "shame, decision fatigue, fear of overdoing week one, and wanting visible proof of progress",
      resonanceFrame: "motivation into a minimum effective plan",
      languageSignals:
        "restart, consistency, decision load, minimum effective dose, recovery, realism",
      contentGapOne: "Restart normalization",
      contentGapOneWhy:
        "People returning to training need permission to restart without feeling like they have failed.",
      contentGapOneExperiment: (platform: string, signal: string, metric: string) =>
        `Publish a ${platform} post that normalizes ${signal} and compare ${metric} to a hype-led transformation post.`,
      contentGapTwo: "Minimum effective plan",
      contentGapTwoWhy:
        "A simple plan reduces decision load and makes consistency feel possible again.",
      contentGapTwoExperiment: (
        platform: string,
        evidence: string,
        metric: string,
      ) =>
        `Run a ${platform} carousel with a minimum effective week-one plan that names ${evidence} and compare ${metric} from returning trainees.`,
      contentGapThree: "Embarrassment and identity",
      contentGapThreeWhy:
        "The audience needs content that acknowledges the identity shift of starting over without sounding patronizing.",
      contentGapThreeExperiment: (
        platform: string,
        rationale: string,
        metric: string,
      ) =>
        `Test two ${platform} hooks: one that names embarrassment and one that names ambition; compare ${metric} and use ${rationale} to keep the frame realistic.`,
      contentGapFour: "Realistic progression framing",
      contentGapFourWhy:
        "Progress feels more credible when the content shows slow, repeatable wins instead of extreme routines.",
      contentGapFourExperiment: (
        platform: string,
        signal: string,
        metric: string,
      ) =>
        `Share a ${platform} before/after series around realistic progression and start with ${signal}; compare ${metric}.`,
      hookOne: "Most people returning to the gym do too much in week one",
      hookTwo:
        "Consistency comes from reducing decision load, not from a more complicated split",
      hookThree: "The real problem is not motivation, it is restart friction",
      hookFour: "If the plan feels impressive, it is probably too much for week one",
      hookFive: "The audience wants proof they can restart without becoming extreme",
      titleOne: "The Minimum Effective Plan for Returning to Training",
      titleTwo: "Why Restarting Fitness Requires Less Complexity, Not More",
      titleThree: "How to Normalize the Gym Comeback Without Lowering Standards",
      titleFour: "The Fitness Messaging Shift That Actually Helps Busy Adults",
      titleFive: "What Returning Lifters Need to Believe Before Week One",
      shortIdeaOne:
        "Open with the idea that week one should lower decision load, then show the plan that makes consistency feel possible.",
      shortAngleOne:
        "Restart-friendly framing. This resonates because it treats the audience like adults with busy lives, not beginners to shame.",
      shortIdeaTwo:
        "Compare a complicated split with a minimum effective plan and show why realistic progression wins.",
      shortAngleTwo:
        "Plan simplicity. This makes the content feel actionable instead of aspirational.",
      shortIdeaThree:
        "Show before-and-after behavior: overwhelmed restart versus calm repeatable routine.",
      shortAngleThree:
        "Before/after workflow. This gives the audience a clear mental model of the change.",
      repurposedPost:
        "Returning to training is less about intensity and more about making the restart feel possible on a real calendar.",
      repurposedNote:
        "The best fitness content for this audience normalizes the restart without lowering the standard.",
      repurposedScript:
        "Ask what makes week one feel too big, then reduce the plan until it is easy to repeat.",
      repurposedPrompt:
        "What part of restarting feels embarrassing, what decision load is too high, and what proof of progress would make the plan feel credible?",
      experimentOne: (platform: string, metric: string) =>
        `Run a ${platform} restart-led hook against an intensity-led hook and compare ${metric}.`,
      experimentTwo: (metric: string) =>
        `Post a minimum effective week-one plan and ask which part feels easiest to repeat; compare ${metric}.`,
      experimentThree: (platform: string, signal: string) =>
        `Share a realistic progression carousel on ${platform} that starts with ${signal} and compare shares from people returning to training.`,
      experimentFour: (rationale: string) =>
        `Test an embarrassment-aware post about starting over and keep the tone grounded in ${rationale}.`,
      experimentFive: (platform: string, evidence: string) =>
        `Publish a before/after post about decision load on ${platform} using ${evidence} and compare saves.`,
    };
  }

  if (mode === "educational_youtube") {
    return {
      ...source,
      primaryTension:
        "curious viewers leave when the story starts with context instead of consequence",
      primaryHook: "consequence-first YouTube storytelling",
      audiencePsychology:
        "curiosity, pattern recognition, surprise, and wanting the payoff before the explanation",
      resonanceFrame: "academic accuracy into retention-first storytelling",
      languageSignals: "hook, consequence, tension, payoff, retention, curiosity, context",
      contentGapOne: "Consequence-first openings",
      contentGapOneWhy:
        "Short-form viewers decide fast; consequence creates curiosity before the background arrives.",
      contentGapOneExperiment: (platform: string, signal: string, metric: string) =>
        `Post a ${platform} short that opens with ${signal} and compare ${metric} to a background-first version.`,
      contentGapTwo: "Story engine in the first seconds",
      contentGapTwoWhy:
        "The audience needs the tension early so the context feels worth staying for.",
      contentGapTwoExperiment: (
        platform: string,
        evidence: string,
        metric: string,
      ) =>
        `Test a ${platform} short with consequence, tension, then context around ${evidence} and compare ${metric}.`,
      contentGapThree: "Accuracy plus momentum",
      contentGapThreeWhy:
        "Educational content works better when the explanation stays accurate but the pacing is built for attention.",
      contentGapThreeExperiment: (
        platform: string,
        rationale: string,
        metric: string,
      ) =>
        `Share a ${platform} post on how to keep historical accuracy while improving pacing and compare ${metric} with ${rationale}.`,
      contentGapFour: "Repeatable curiosity series",
      contentGapFourWhy:
        "A repeatable series helps the audience learn the channel's promise and signals consistency without sameness.",
      contentGapFourExperiment: (
        platform: string,
        signal: string,
        metric: string,
      ) =>
        `Launch a ${platform} series with one surprising decision per post that starts from ${signal} and compare ${metric}.`,
      hookOne: "The strongest history videos start with the consequence, not the timeline",
      hookTwo: "If the first 3 seconds are background, the viewer has already left",
      hookThree: "A history short needs a story engine, not a lecture opener",
      hookFour: "Curious adults stay for tension, not chronology",
      hookFive: "Accuracy matters, but pacing decides whether the viewer keeps watching",
      titleOne: "Consequence First: The YouTube Shorts Rule for History Creators",
      titleTwo: "Why History Shorts Lose Viewers Before the Explanation Starts",
      titleThree: "How to Turn Scholarly Accuracy into a Story Engine",
      titleFour: "The Hook Order That Keeps Educational Shorts Watching",
      titleFive: "What Curious Adults Need to Feel Before They Stay",
      shortIdeaOne:
        "Open with the consequence, then show why viewers stay once the tension is clear.",
      shortAngleOne:
        "Consequence-first opening. This feels native to Shorts because it earns retention before the context arrives.",
      shortIdeaTwo:
        "Compare background-first and tension-first openings in one simple breakdown.",
      shortAngleTwo:
        "Retention contrast. This makes the platform lesson obvious without a long explanation.",
      shortIdeaThree:
        "Show how a historical fact becomes a story engine in three steps: consequence, tension, context.",
      shortAngleThree:
        "Story engine framing. This keeps the educational promise while reducing drop-off.",
      repurposedPost:
        "Educational content keeps viewers longer when the payoff arrives before the background.",
      repurposedNote:
        "For Shorts, the viewer needs the consequence fast enough to care about the context.",
      repurposedScript:
        "Start with what changed, what was at risk, or what surprised people, then earn the explanation.",
      repurposedPrompt:
        "What consequence would make the viewer curious in three seconds, and what context can follow without slowing them down?",
      experimentOne: (platform: string, metric: string) =>
        `Run a ${platform} consequence-first short against a background-first short and compare ${metric}.`,
      experimentTwo: (metric: string) =>
        `Post a story-engine breakdown and ask viewers which opening made them stay; compare ${metric}.`,
      experimentThree: (platform: string, signal: string) =>
        `Publish an accuracy-plus-momentum post on ${platform} that starts with ${signal} and compare saves to a standard lecture-style post.`,
      experimentFour: (rationale: string) =>
        `Launch a repeatable curiosity series and keep the hook structure aligned with ${rationale}.`,
      experimentFive: (platform: string, evidence: string) =>
        `Test a tension-first hook on ${platform} anchored in ${evidence} and measure rewatches.`,
    };
  }

  return {
    ...source,
    primaryTension:
      "the transcript points to a gap between the work being described and the audience problem being solved",
    primaryHook: "audience-first strategy",
    audiencePsychology:
      "belief change, decision friction, and the need for a concrete next move",
    resonanceFrame: "raw source material into audience-first strategy",
    languageSignals: "signal, gaps, objections, experiments, proof, next move",
    contentGapOne: "Audience diagnosis before asset production",
    contentGapOneWhy:
      "The audience should see why diagnosis changes the quality of every downstream asset.",
    contentGapOneExperiment: (platform: string, signal: string, metric: string) =>
      `Publish a ${platform} post comparing a generic repurposing workflow with an audience-intelligence-first workflow around ${signal} and track ${metric}.`,
    contentGapTwo: "Proof that content gaps are discoverable from messy source material",
    contentGapTwoWhy:
      "Creators may agree with the strategy but doubt that transcripts and notes can reveal useful audience objections.",
    contentGapTwoExperiment: (
      platform: string,
      evidence: string,
      metric: string,
    ) =>
      `Share one anonymized transcript excerpt, extract three audience gaps from it, and ask readers which gap feels most commercially urgent on ${platform}; compare ${metric} and call out ${evidence}.`,
    contentGapThree: "Platform behavior tied to strategic intent",
    contentGapThreeWhy:
      "The audience needs to understand that a strong idea should be shaped differently depending on whether the goal is replies, saves, shares, or clicks.",
    contentGapThreeExperiment: (
      platform: string,
      rationale: string,
      metric: string,
    ) =>
      `Run two ${platform} variants from the same insight: one optimized for replies and one optimized for saves. Compare ${metric} and note how ${rationale} changes the response.`,
    contentGapFour: "Repeatable series for audience objections",
    contentGapFourWhy:
      "A recurring series can train the audience to see CreatorOS as the system for diagnosing growth blockers.",
    contentGapFourExperiment: (platform: string, signal: string, metric: string) =>
      `Launch a three-part ${platform} series: one audience objection per post, one content gap behind it, and one experiment the creator can run that week around ${signal}; compare ${metric}.`,
    hookOne: "Most creators do not have a content problem. They have an audience signal problem",
    hookTwo:
      "If your posts are accurate but ignored, you may be answering the wrong audience question",
    hookThree: "Repurposing without audience intelligence just multiplies weak positioning",
    hookFour: "Before you turn one idea into ten assets, find the content gap the audience already feels",
    hookFive:
      "The best platform-native ideas start with a testable audience hypothesis, not a blank page",
    titleOne: "Audience Intelligence Before Repurposing: A Better Creator Workflow",
    titleTwo: "How Creators Find the Content Gaps Their Audience Feels",
    titleThree: "From Raw Transcript to Platform-Aware Growth Strategy",
    titleFour: "A Practical Growth Pack for the Audience You Named",
    titleFive: "Why Strong Creator Content Starts With Audience Diagnosis",
    shortIdeaOne:
      "State the hypothesis that low engagement often comes from weak audience diagnosis, then show the three questions CreatorOS asks before repurposing.",
    shortAngleOne:
      "Resonates because it names the hidden failure mode behind flat content.",
    shortIdeaTwo:
      "Compare a generic post angle with a gap-led angle that handles a specific objection from the audience.",
    shortAngleTwo:
      "Makes the value of audience intelligence visible instead of abstract.",
    shortIdeaThree:
      "Show how one transcript becomes audience insight, hook hypothesis, platform angle, and a measurable experiment.",
    shortAngleThree:
      "Demonstrates strategic repurposing without promising automatic growth.",
    repurposedPost:
      "Most creators turn one idea into more posts. The sharper move is to turn one source into audience intelligence first: what does the audience believe, what objection is blocking them, and what content gap has not been answered yet?",
    repurposedNote:
      "This demo mode should stay practical and avoid generic creator advice.",
    repurposedScript:
      "If your content is useful but not moving, ask three questions: what objection does this handle, what content gap does it fill, and what platform behavior are we trying to earn?",
    repurposedPrompt:
      "What does your audience already know, what do they still misunderstand, and what proof would make them act this week?",
    experimentOne: (platform: string, metric: string) =>
      `Run a three-hook test on ${platform}: one pain-led hook, one objection-led hook, and one content-gap hook. Compare ${metric} after 48 hours.`,
    experimentTwo: (metric: string) =>
      `Publish one diagnostic post that asks the audience to choose their biggest blocker. Use the top reply as the next content gap brief and compare ${metric}.`,
    experimentThree: (platform: string, signal: string) =>
      `Turn the same transcript into two assets only on ${platform}: one strategy post and one short diagnostic script that starts from ${signal}. Compare which creates more qualified replies.`,
    experimentFour: (rationale: string) =>
      `Test a before/after framing that shows raw idea versus audience-intelligence-led output and explains why ${rationale}. Track comments that mention clarity, relevance, or timing.`,
    experimentFive: (platform: string, evidence: string) =>
      `Ask the audience which title feels most urgent, then publish the winning angle on ${platform} with ${evidence} addressed in the first third.`,
  };
}

function getPlatformFrame(platform: TargetPlatform): PlatformFrame {
  switch (platform) {
    case "LinkedIn":
      return {
        formatLead: "LinkedIn diagnostic post",
        rationale: "internal-justification language",
        experimentMetric: "saves and qualified comments",
      };
    case "X":
      return {
        formatLead: "X thesis post",
        rationale: "fast contrarian signal",
        experimentMetric: "replies and profile visits",
      };
    case "TikTok":
      return {
        formatLead: "TikTok short",
        rationale: "spoken hook with quick proof",
        experimentMetric: "watch time and comments",
      };
    case "Instagram":
      return {
        formatLead: "Instagram carousel",
        rationale: "saveable visual contrast",
        experimentMetric: "saves and shares",
      };
    case "YouTube Shorts":
      return {
        formatLead: "YouTube Shorts hook",
        rationale: "retention through fast payoff",
        experimentMetric: "retention and rewatches",
      };
    case "Newsletter":
    default:
      return {
        formatLead: "Newsletter note",
        rationale: "diagnostic depth and internal clarity",
        experimentMetric: "opens and replies",
      };
  }
}

function analyzeSourceMaterial(text: string, mode: DemoMode) {
  const normalized = text.toLowerCase();
  const fallback = summarizeTranscript(text);

  switch (mode) {
    case "technical_founder":
      return {
        sourceSignal: pickPhrase(
          normalized,
          [
            [/production readiness/, "production readiness"],
            [/incident|risk/, "incident prevention"],
            [/maintenance|burden/, "maintenance burden"],
            [/evaluation|confidence/, "evaluation confidence"],
            [/drift|deploy/, "workflow drift"],
          ],
          "production readiness",
        ),
        sourceEvidence: pickPhrase(
          normalized,
          [
            [/production readiness/, "production readiness"],
            [/incident|risk/, "incident prevention"],
            [/maintenance|burden/, "maintenance burden"],
            [/workflow drift/, "workflow drift"],
          ],
          fallback,
        ),
      };
    case "fitness_creator":
      return {
        sourceSignal: pickPhrase(
          normalized,
          [
            [/restart friction/, "restart friction"],
            [/decision load/, "decision load"],
            [/week one/, "week one overload"],
            [/returning to training|returning to the gym/, "returning to training"],
            [/realistic progression/, "realistic progression"],
          ],
          "restart friction",
        ),
        sourceEvidence: pickPhrase(
          normalized,
          [
            [/restart friction/, "restart friction"],
            [/decision load/, "decision load"],
            [/week one/, "week one overload"],
            [/realistic progression/, "realistic progression"],
          ],
          fallback,
        ),
      };
    case "educational_youtube":
      return {
        sourceSignal: pickPhrase(
          normalized,
          [
            [/consequence-first/, "consequence-first openings"],
            [/retention/, "retention pressure"],
            [/story engine/, "story engine"],
            [/first three seconds|3 seconds/, "the first three seconds"],
            [/curiosity/, "curiosity before context"],
          ],
          "consequence-first openings",
        ),
        sourceEvidence: pickPhrase(
          normalized,
          [
            [/consequence-first/, "consequence-first openings"],
            [/retention/, "retention pressure"],
            [/story engine/, "story engine"],
            [/history|educational/, "educational pacing"],
          ],
          fallback,
        ),
      };
    case "general":
    default:
      return {
        sourceSignal: fallback,
        sourceEvidence: fallback,
      };
  }
}

function pickPhrase(
  text: string,
  options: Array<[RegExp, string]>,
  fallback: string,
): string {
  for (const [pattern, value] of options) {
    if (pattern.test(text)) {
      return value;
    }
  }

  return fallback;
}

function summarizeTranscript(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= 120) {
    return normalized;
  }

  const truncated = normalized.slice(0, 120).trimEnd();
  return `${truncated.replace(/[.,;:!?\-]+$/, "")}...`;
}

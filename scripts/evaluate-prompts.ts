import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";
import type { GenerateInput } from "@/lib/types/generation";

type EvaluationFixture = GenerateInput & {
  name: string;
};

const evaluationFixtures: EvaluationFixture[] = [
  {
    name: "Technical founder creator",
    creatorNiche: "AI infrastructure and developer tooling",
    targetAudience: "technical founders selling to engineering leaders",
    targetPlatform: "LinkedIn",
    transcript:
      "A lot of technical founders talk about product features before they explain the operational pain. Engineering leaders do not wake up wanting a new SDK. They care about fewer failed deploys, fewer incidents caused by hidden integration drift, and a clearer way to evaluate whether an AI feature is production-ready. The founders who win usually translate technical depth into risk reduction, team velocity, and buyer confidence. The missed opportunity is showing the before-and-after workflow, not just announcing what the tool can do.",
  },
  {
    name: "Fitness creator",
    creatorNiche: "Strength training for busy professionals",
    targetAudience: "busy professionals returning to training after years away",
    targetPlatform: "Instagram",
    transcript:
      "Most people returning to the gym do too much in week one because they want proof that they are serious. Then soreness and schedule friction knock them out by week three. The better message is that consistency comes from reducing decision load and starting with a minimum effective plan. Three full-body sessions, two simple meals on repeat, and a realistic progression beat a complicated six-day split. The audience is embarrassed about starting over, so the content has to normalize that without lowering standards.",
  },
  {
    name: "Educational YouTube creator",
    creatorNiche: "History education on YouTube",
    targetAudience: "curious adults who like deep history but avoid academic lectures",
    targetPlatform: "YouTube Shorts",
    transcript:
      "The channel does best when a historical event is framed around a surprising human decision rather than a date or dynasty. Viewers stay when they understand the tension quickly: what did this person risk, what did they misunderstand, and what changed because of one choice? The weak videos often start with too much background. The strongest shorts open with the consequence, then reveal the context. The content gap is connecting scholarly accuracy with a story engine that works in the first three seconds.",
  },
];

/*
Prompt evaluation rubric:
- Specificity: Does the output use details from the transcript and creator context?
- Strategic usefulness: Would the creator know what to do next and why?
- Platform awareness: Are hooks, formats, and experiments native to the target platform?
- Repetition: Are sections meaningfully different from each other?
- Generic advice: Does it avoid bland guidance like "post consistently" or vague CTAs?
- Experiment quality: Are experiments concrete, measurable, and time-bounded?
- Content gap quality: Are gaps tied to audience questions, objections, weak platform fit,
  overlooked angles, missing pillars, or repeatable series opportunities?
*/

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OPENAI_API_KEY is missing. Evaluations will use mock output, which is useful for shape checks but not prompt-quality review.",
    );
  }

  for (const fixture of evaluationFixtures) {
    console.log(`\n## ${fixture.name}`);
    console.log(
      JSON.stringify(
        {
          niche: fixture.creatorNiche,
          targetAudience: fixture.targetAudience,
          targetPlatform: fixture.targetPlatform,
        },
        null,
        2,
      ),
    );

    const growthPack = await generateCreatorGrowthPack(fixture);

    console.log(JSON.stringify(growthPack, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

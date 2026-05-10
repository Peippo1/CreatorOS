import { loadEnvConfig } from "@next/env";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";
import { createMockGrowthPack } from "@/lib/orchestration/mock-growth-pack";
import type { CreatorGrowthPack, GenerateInput } from "@/lib/types/generation";

type EvaluationFixture = GenerateInput & {
  name: string;
};

type EvaluationFormat = "markdown" | "json";

type EvaluationOptions = {
  write: boolean;
  format: EvaluationFormat;
};

type EvaluationRubricItem = {
  heading: string;
  score: string;
  notes: string;
};

type EvaluationArtifact = {
  fixtureName: string;
  timestamp: string;
  modelUsed: string;
  usedMockData: boolean;
  input: Pick<
    GenerateInput,
    "creatorNiche" | "targetAudience" | "targetPlatform" | "transcript"
  >;
  rubric: EvaluationRubricItem[];
  growthPack: CreatorGrowthPack;
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

const rubricHeadings = [
  "Specificity",
  "Strategic usefulness",
  "Platform awareness",
  "Repetition risk",
  "Generic advice risk",
  "Experiment quality",
  "Content gap quality",
] as const;

/*
Prompt evaluation rubric:
- Specificity: Does the output use details from the transcript and creator context?
- Strategic usefulness: Would the creator know what to do next and why?
- Platform awareness: Are hooks, formats, and experiments native to the target platform?
- Repetition risk: Are sections meaningfully different from each other?
- Generic advice risk: Does it avoid bland guidance like "post consistently" or vague CTAs?
- Experiment quality: Are experiments concrete, measurable, and time-bounded?
- Content gap quality: Are gaps tied to audience questions, objections, weak platform fit,
  overlooked angles, missing pillars, or repeatable series opportunities?
*/

export function parseEvaluationOptions(argv: string[]): EvaluationOptions {
  let write = false;
  let format: EvaluationFormat = "markdown";

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--write") {
      write = true;
      continue;
    }

    if (arg === "--json") {
      format = "json";
      continue;
    }

    if (arg === "--format") {
      const nextValue = argv[index + 1];
      if (nextValue !== "markdown" && nextValue !== "json") {
        throw new Error(
          "Expected --format to be followed by markdown or json.",
        );
      }

      format = nextValue;
      index += 1;
      continue;
    }

    if (arg.startsWith("--format=")) {
      const value = arg.split("=", 2)[1];
      if (value !== "markdown" && value !== "json") {
        throw new Error(
          "Expected --format=markdown or --format=json.",
        );
      }

      format = value;
    }
  }

  return { write, format };
}

export function buildEvaluationArtifact(
  fixture: EvaluationFixture,
  growthPack: CreatorGrowthPack,
  timestamp: string,
): EvaluationArtifact {
  return {
    fixtureName: fixture.name,
    timestamp,
    modelUsed: growthPack.meta.model,
    usedMockData: growthPack.meta.usedMockData,
    input: {
      creatorNiche: fixture.creatorNiche,
      targetAudience: fixture.targetAudience,
      targetPlatform: fixture.targetPlatform,
      transcript: fixture.transcript,
    },
    rubric: rubricHeadings.map((heading) => ({
      heading,
      score: "",
      notes: "",
    })),
    growthPack,
  };
}

export function formatEvaluationMarkdown(artifact: EvaluationArtifact): string {
  const lines = [
    `# ${artifact.fixtureName}`,
    "",
    `- Timestamp: ${artifact.timestamp}`,
    `- Model used: ${artifact.modelUsed}`,
    `- Mock data used: ${artifact.usedMockData ? "yes" : "no"}`,
    `- Creator niche: ${artifact.input.creatorNiche}`,
    `- Target audience: ${artifact.input.targetAudience}`,
    `- Target platform: ${artifact.input.targetPlatform}`,
    "",
    "## Transcript",
    "",
    artifact.input.transcript,
    "",
    "## Rubric",
    "",
    ...artifact.rubric.flatMap((item) => [
      `### ${item.heading}`,
      `- Score: ${item.score}`,
      `- Notes: ${item.notes}`,
      "",
    ]),
    "## Growth Pack",
    "",
    "```json",
    JSON.stringify(artifact.growthPack, null, 2),
    "```",
    "",
  ];

  return lines.join("\n");
}

export function formatEvaluationJson(artifact: EvaluationArtifact): string {
  return JSON.stringify(artifact, null, 2);
}

export async function runEvaluations(options: EvaluationOptions): Promise<void> {
  loadEnvConfig(process.cwd());

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OPENAI_API_KEY is missing. Evaluations will use mock output, which is useful for shape checks but not prompt-quality review.",
    );
  }

  const timestamp = new Date().toISOString();
  const outputDirectory = path.join(process.cwd(), "evaluations");

  if (options.write) {
    await mkdir(outputDirectory, { recursive: true });
  }

  for (const fixture of evaluationFixtures) {
    let growthPack: CreatorGrowthPack;

    try {
      growthPack = await generateCreatorGrowthPack(fixture);
    } catch (error) {
      console.warn(
        `Live evaluation failed for "${fixture.name}". Falling back to deterministic mock output.`,
      );
      console.warn(error instanceof Error ? error.message : String(error));
      growthPack = createMockGrowthPack(fixture);
    }

    const artifact = buildEvaluationArtifact(fixture, growthPack, timestamp);

    console.log(`\n## ${artifact.fixtureName}`);
    console.log(
      `- Model used: ${artifact.modelUsed} | Mock data: ${artifact.usedMockData ? "yes" : "no"}`,
    );
    console.log(`- Target platform: ${artifact.input.targetPlatform}`);

    for (const rubricItem of artifact.rubric) {
      console.log(`### ${rubricItem.heading}`);
      console.log("- Score: ");
      console.log("- Notes: ");
    }

    console.log("### Growth Pack");
    console.log(JSON.stringify(artifact.growthPack, null, 2));

    if (!options.write) {
      continue;
    }

    const slug = fixture.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const fileStem = `${timestamp.replace(/[:.]/g, "-")}-${slug}`;
    const filePath = path.join(
      outputDirectory,
      `${fileStem}.${options.format === "json" ? "json" : "md"}`,
    );
    const content =
      options.format === "json"
        ? formatEvaluationJson(artifact)
        : formatEvaluationMarkdown(artifact);

    await writeFile(filePath, content, "utf8");
    console.log(`- Wrote ${path.relative(process.cwd(), filePath)}`);
  }
}

async function main() {
  const options = parseEvaluationOptions(process.argv.slice(2));
  await runEvaluations(options);
}

const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMainModule) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

import type { AudienceSignal } from "@/lib/types/product";

const SIGNAL_PATTERNS: Array<{ kind: AudienceSignal["kind"]; pattern: RegExp; statement: string }> = [
  { kind: "pain_point", pattern: /(?:struggle|problem|frustrat|hard|overwhelm|stuck|pain)/i, statement: "Audience pain point" },
  { kind: "objection", pattern: /(?:but |can't|cannot|don't have|too expensive|not sure|skeptic)/i, statement: "Audience objection" },
  { kind: "motivation", pattern: /(?:want|need|goal|hope|grow|earn|save time|improve)/i, statement: "Audience motivation" },
  { kind: "language", pattern: /(?:"[^"]+"|'[^']+')/, statement: "Audience language" },
];

function sentenceCandidates(content: string) {
  return content.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 20);
}

export function extractAudienceSignals(content: string): AudienceSignal[] {
  const signals: AudienceSignal[] = [];
  for (const sentence of sentenceCandidates(content)) {
    for (const match of SIGNAL_PATTERNS) {
      if (!match.pattern.test(sentence) || signals.some((signal) => signal.kind === match.kind)) continue;
      signals.push({ kind: match.kind, statement: match.statement, evidence: sentence.slice(0, 320), confidence: "medium" });
      if (signals.length === 5) break;
    }
    if (signals.length === 5) break;
  }
  if (!signals.length) {
    const evidence = sentenceCandidates(content)[0] ?? content.slice(0, 320);
    signals.push({ kind: "content_pillar", statement: "Potential content pillar", evidence, confidence: "low" });
  }
  return signals;
}

import type { ContentExperiment, LearningInsight, PerformanceSnapshot } from "@/lib/types/product";

export function analysePerformance(experiments: ContentExperiment[], snapshots: PerformanceSnapshot[]): LearningInsight[] {
  if (!snapshots.length) return [{ title: "Start the learning loop", evidence: "No published outcomes have been recorded yet.", recommendation: "Publish one experiment and record its results so CreatorOS can compare your hypotheses with reality.", confidence: "low" }];
  const byExperiment = new Map(experiments.map((item) => [item.id, item]));
  const ranked = snapshots.map((snapshot) => ({ snapshot, experiment: byExperiment.get(snapshot.experimentId) })).filter((item): item is { snapshot: PerformanceSnapshot; experiment: ContentExperiment } => Boolean(item.experiment));
  const top = [...ranked].sort((a, b) => score(b.snapshot) - score(a.snapshot))[0];
  const low = [...ranked].sort((a, b) => score(a.snapshot) - score(b.snapshot))[0];
  const insights: LearningInsight[] = [];
  if (top) insights.push({ title: `Your strongest signal is ${top.experiment.format} on ${top.experiment.platform}`, evidence: `${top.experiment.title} produced ${top.snapshot.views.toLocaleString()} views, ${top.snapshot.clicks.toLocaleString()} clicks, and ${top.snapshot.signups.toLocaleString()} signups.`, recommendation: `Run a close variant of the same ${top.experiment.format} while changing only the hook or audience problem.`, confidence: snapshots.length >= 3 ? "high" : "medium" });
  if (low && low.snapshot.id !== top?.snapshot.id) insights.push({ title: "Retire or revise the weakest bet", evidence: `${low.experiment.title} has the lowest combined outcome score in the recorded set.`, recommendation: "Do not repeat it unchanged. Rewrite the opening around a sharper audience pain point or change the format.", confidence: snapshots.length >= 3 ? "medium" : "low" });
  const conversion = snapshots.reduce((sum, item) => sum + item.signups, 0) / Math.max(1, snapshots.reduce((sum, item) => sum + item.views, 0));
  insights.push({ title: "Track the business outcome, not only reach", evidence: `${(conversion * 100).toFixed(2)}% of recorded views became signups across this set.`, recommendation: "Keep recording clicks and signups so the next recommendation optimizes for your offer rather than vanity metrics.", confidence: snapshots.length >= 3 ? "medium" : "low" });
  return insights;
}

function score(snapshot: PerformanceSnapshot) { return snapshot.views + snapshot.likes * 4 + snapshot.comments * 8 + snapshot.shares * 10 + snapshot.saves * 8 + snapshot.clicks * 20 + snapshot.signups * 100 + snapshot.qualifiedLeads * 250 + snapshot.revenue * 2; }

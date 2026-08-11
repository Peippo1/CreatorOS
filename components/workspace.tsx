"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContentExperiment, CreatorProfile, LearningInsight, PerformanceSnapshot, SourceDocument } from "@/lib/types/product";

const emptyProfile: CreatorProfile = { positioning: "", offer: "", audienceSegments: [], painPoints: [], objections: [], motivations: [], contentPillars: [], brandVoice: "", prohibitedClaims: [], conversionGoal: "", platformPriorities: [] };
const split = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const join = (value: string[]) => value.join("\n");

export function Workspace() {
  const [profile, setProfile] = useState<CreatorProfile>(emptyProfile);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [experiments, setExperiments] = useState<ContentExperiment[]>([]);
  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [source, setSource] = useState({ title: "", type: "transcript", content: "" });
  const [metric, setMetric] = useState({ experimentId: "", publishedAt: new Date().toISOString().slice(0, 10), views: "", clicks: "", signups: "", likes: "", comments: "", shares: "", saves: "", revenue: "" });
  const [message, setMessage] = useState("");
  const [authRequired, setAuthRequired] = useState(false);

  async function load() {
    const [profileResponse, sourceResponse, experimentResponse, metricResponse, learningResponse] = await Promise.all([fetch("/api/profile"), fetch("/api/sources"), fetch("/api/experiments"), fetch("/api/performance"), fetch("/api/learning")]);
    if ([profileResponse, sourceResponse, experimentResponse, metricResponse, learningResponse].some((response) => response.status === 401)) { setAuthRequired(true); return; }
    const [profileData, sourceData, experimentData, metricData, learningData] = await Promise.all([profileResponse.json(), sourceResponse.json(), experimentResponse.json(), metricResponse.json(), learningResponse.json()]);
    setProfile(profileData.profile ?? emptyProfile); setSources(sourceData.sources ?? []); setExperiments(experimentData.experiments ?? []); setSnapshots(metricData.snapshots ?? []); setInsights(learningData.insights ?? []);
  }
  // Loading persisted workspace state is the synchronization this effect owns.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  if (authRequired) return <Card><CardHeader><CardTitle>Sign in to use your workspace</CardTitle><CardDescription>Your profile, evidence, experiments, and outcomes are private to your account.</CardDescription></CardHeader><CardContent><Button asChild><a href="/login">Sign in</a></Button></CardContent></Card>;

  async function saveProfile(event: FormEvent) { event.preventDefault(); setMessage("Saving profile…"); const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) }); setMessage(response.ok ? "Profile saved." : "Could not save profile."); }
  async function addSource(event: FormEvent) { event.preventDefault(); setMessage("Saving source…"); const response = await fetch("/api/sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(source) }); if (response.ok) { const data = await response.json() as { source: SourceDocument }; setSource({ title: "", type: "transcript", content: "" }); await load(); setMessage(`Source added with ${data.source.signals.length} evidence-backed audience signal${data.source.signals.length === 1 ? "" : "s"}.`); } else setMessage("Could not save source."); }
  async function addExperiment(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const response = await fetch("/api/experiments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "New content experiment", platform: "LinkedIn", format: "Short post", ...Object.fromEntries(new FormData(event.currentTarget)) }) }); if (response.ok) { event.currentTarget.reset(); await load(); setMessage("Experiment added."); } }
  function changeExperiment(id: string, patch: Partial<ContentExperiment>) {
    setExperiments((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }
  async function saveExperiment(item: ContentExperiment) {
    setMessage("Saving experiment…");
    const response = await fetch(`/api/experiments/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        audienceSegment: item.audienceSegment,
        audienceProblem: item.audienceProblem,
        hook: item.hook,
        platform: item.platform,
        format: item.format,
        cta: item.cta,
        intendedOutcome: item.intendedOutcome,
        hypothesis: item.hypothesis,
        draft: item.draft,
        plannedPublishDate: item.plannedPublishDate,
        variantLabel: item.variantLabel,
        status: item.status,
      }),
    });
    if (response.ok) {
      await load();
      setMessage("Experiment saved.");
    } else {
      setMessage("Could not save experiment.");
    }
  }
  async function updateStatus(id: string, status: ContentExperiment["status"]) { await fetch(`/api/experiments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); await load(); }
  async function addMetric(event: FormEvent) { event.preventDefault(); const response = await fetch("/api/performance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...metric, views: metric.views || 0, clicks: metric.clicks || 0, signups: metric.signups || 0, likes: metric.likes || 0, comments: metric.comments || 0, shares: metric.shares || 0, saves: metric.saves || 0, revenue: metric.revenue || 0 }) }); if (response.ok) { await load(); setMessage("Outcome recorded."); } }

  return <div className="grid gap-6 lg:grid-cols-[1fr_1fr]"><Card><CardHeader><CardTitle>1. Growth profile</CardTitle><CardDescription>Give the system durable context about your business and audience.</CardDescription></CardHeader><CardContent><form className="flex flex-col gap-4" onSubmit={saveProfile}><Field label="Positioning"><Input value={profile.positioning} onChange={(e) => setProfile({ ...profile, positioning: e.target.value })} placeholder="I help..." /></Field><Field label="Offer"><Input value={profile.offer} onChange={(e) => setProfile({ ...profile, offer: e.target.value })} placeholder="Course, consulting, membership, product..." /></Field><Field label="Audience segments"><Textarea rows={3} value={join(profile.audienceSegments)} onChange={(e) => setProfile({ ...profile, audienceSegments: split(e.target.value) })} placeholder="One segment per line" /></Field><Field label="Pain points and objections"><Textarea rows={4} value={join([...profile.painPoints, ...profile.objections])} onChange={(e) => setProfile({ ...profile, painPoints: split(e.target.value), objections: [] })} placeholder="One audience tension per line" /></Field><Field label="Brand voice"><Input value={profile.brandVoice} onChange={(e) => setProfile({ ...profile, brandVoice: e.target.value })} placeholder="Clear, direct, generous, technically rigorous" /></Field><Field label="Conversion goal"><Input value={profile.conversionGoal} onChange={(e) => setProfile({ ...profile, conversionGoal: e.target.value })} placeholder="Newsletter subscribers, qualified calls, product sales..." /></Field><Button type="submit">Save growth profile</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Evidence library</CardTitle><CardDescription>Transcripts and audience language become evidence for future recommendations.</CardDescription></CardHeader><CardContent><form className="flex flex-col gap-4" onSubmit={addSource}><Field label="Source title"><Input required value={source.title} onChange={(e) => setSource({ ...source, title: e.target.value })} placeholder="Podcast episode: audience research" /></Field><Field label="Source type"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={source.type} onChange={(e) => setSource({ ...source, type: e.target.value })}><option value="transcript">Transcript</option><option value="podcast_notes">Podcast notes</option><option value="sales_call">Sales call</option><option value="comment">Comment</option><option value="audience_question">Audience question</option><option value="research">Research</option></select></Field><Field label="Content"><Textarea required minLength={20} rows={7} value={source.content} onChange={(e) => setSource({ ...source, content: e.target.value })} placeholder="Paste a transcript, notes, comments, or research..." /></Field><Button type="submit" variant="outline">Add evidence</Button></form><div className="mt-6 flex flex-col gap-2">{sources.slice(0, 5).map((item) => <div key={item.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.type} · {new Date(item.createdAt).toLocaleDateString()}</p></div>)}{!sources.length && <p className="text-sm text-muted-foreground">No evidence added yet.</p>}</div></CardContent></Card><Card className="lg:col-span-2"><CardHeader><CardTitle>2. Experiment queue</CardTitle><CardDescription>Capture the decision behind each piece of content, then move it through your weekly workflow.</CardDescription></CardHeader><CardContent><form className="grid gap-3 md:grid-cols-4" onSubmit={addExperiment}><Input name="title" required placeholder="Experiment title" className="md:col-span-2" /><Input name="platform" placeholder="Platform" defaultValue="LinkedIn" /><Input name="format" placeholder="Format" defaultValue="Short post" /><Input name="hook" placeholder="Hook or angle" className="md:col-span-2" /><Input name="hypothesis" placeholder="Hypothesis" className="md:col-span-2" /><Input name="intendedOutcome" placeholder="Outcome: clicks, signups..." /><Button type="submit">Add experiment</Button></form><div className="mt-6 grid gap-3 md:grid-cols-2">{experiments.map((item) => <article key={item.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div className="grid min-w-0 flex-1 gap-2"><Input aria-label={`Title for ${item.title}`} value={item.title} onChange={(e) => changeExperiment(item.id, { title: e.target.value })} /><p className="text-xs text-muted-foreground">{item.platform} · {item.format} · {item.sourceReference || "Manual experiment"} · {item.variantLabel}</p><Input aria-label={`Hook for ${item.title}`} value={item.hook} onChange={(e) => changeExperiment(item.id, { hook: e.target.value })} placeholder="Hook or angle" /><Textarea aria-label={`Hypothesis for ${item.title}`} rows={2} value={item.hypothesis} onChange={(e) => changeExperiment(item.id, { hypothesis: e.target.value })} placeholder="Hypothesis" /><Textarea aria-label={`Draft for ${item.title}`} rows={3} value={item.draft} onChange={(e) => changeExperiment(item.id, { draft: e.target.value })} placeholder="Draft or content idea" /><Button type="button" variant="outline" onClick={() => void saveExperiment(item)}>Save changes</Button></div><select aria-label={`Status for ${item.title}`} className="rounded border bg-background px-2 py-1 text-xs" value={item.status} onChange={(e) => void updateStatus(item.id, e.target.value as ContentExperiment["status"])}>{["idea", "drafting", "ready", "published", "reviewed"].map((status) => <option key={status}>{status}</option>)}</select></div></article>)}{!experiments.length && <p className="text-sm text-muted-foreground">Generate a Growth Pack or add your first experiment here.</p>}</div></CardContent></Card><Card><CardHeader><CardTitle>3. Record outcomes</CardTitle><CardDescription>Manual metrics are enough to start learning before platform integrations.</CardDescription></CardHeader><CardContent><form className="grid gap-3 sm:grid-cols-2" onSubmit={addMetric}><select required aria-label="Experiment" className="h-10 rounded-md border bg-background px-3 text-sm sm:col-span-2" value={metric.experimentId} onChange={(e) => setMetric({ ...metric, experimentId: e.target.value })}><option value="">Choose an experiment</option>{experiments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><Input required type="date" aria-label="Published date" value={metric.publishedAt} onChange={(e) => setMetric({ ...metric, publishedAt: e.target.value })} /><Input type="number" min="0" placeholder="Views" value={metric.views} onChange={(e) => setMetric({ ...metric, views: e.target.value })} /><Input type="number" min="0" placeholder="Clicks" value={metric.clicks} onChange={(e) => setMetric({ ...metric, clicks: e.target.value })} /><Input type="number" min="0" placeholder="Signups" value={metric.signups} onChange={(e) => setMetric({ ...metric, signups: e.target.value })} /><Input type="number" min="0" placeholder="Likes" value={metric.likes} onChange={(e) => setMetric({ ...metric, likes: e.target.value })} /><Input type="number" min="0" placeholder="Comments" value={metric.comments} onChange={(e) => setMetric({ ...metric, comments: e.target.value })} /><Input type="number" min="0" placeholder="Shares" value={metric.shares} onChange={(e) => setMetric({ ...metric, shares: e.target.value })} /><Input type="number" min="0" placeholder="Saves" value={metric.saves} onChange={(e) => setMetric({ ...metric, saves: e.target.value })} /><Button type="submit" className="sm:col-span-2">Record outcome</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Weekly learning</CardTitle><CardDescription>What your recorded outcomes suggest testing next.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{insights.map((item) => <div key={item.title} className="rounded-lg border p-4"><p className="font-medium">{item.title}</p><p className="mt-2 text-sm text-muted-foreground">{item.evidence}</p><p className="mt-2 text-sm">Next: {item.recommendation}</p></div>)}{!insights.length && <p className="text-sm text-muted-foreground">Record an outcome to generate your first learning review.</p>}<p className="text-xs text-muted-foreground">{snapshots.length} outcome{snapshots.length === 1 ? "" : "s"} recorded. {message}</p></CardContent></Card></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="flex flex-col gap-2"><Label>{label}</Label>{children}</div>; }

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isProductionPersistenceConfigured } from "@/lib/config/runtime";
import type { BetaEvent, BetaEventName, ContentExperiment, CreatorProfile, PerformanceSnapshot, SourceDocument } from "@/lib/types/product";

type NewExperiment = Omit<ContentExperiment, "id" | "createdAt" | "updatedAt" | "status"> & { status?: ContentExperiment["status"] };
type Store = {
  getProfile(userId: string): Promise<CreatorProfile | null>;
  saveProfile(userId: string, profile: CreatorProfile): Promise<CreatorProfile>;
  listSources(userId: string): Promise<SourceDocument[]>;
  getSource(userId: string, id: string): Promise<SourceDocument | null>;
  addSource(userId: string, source: Omit<SourceDocument, "id" | "createdAt">): Promise<SourceDocument>;
  deleteSource(userId: string, id: string): Promise<boolean>;
  listExperiments(userId: string): Promise<ContentExperiment[]>;
  addExperiment(userId: string, experiment: NewExperiment): Promise<ContentExperiment>;
  updateExperiment(userId: string, id: string, patch: Partial<ContentExperiment>): Promise<ContentExperiment | null>;
  listPerformance(userId: string): Promise<PerformanceSnapshot[]>;
  addPerformance(userId: string, metric: Omit<PerformanceSnapshot, "id" | "createdAt">): Promise<PerformanceSnapshot>;
  trackEvent(userId: string, name: BetaEventName): Promise<void>;
  listEvents(userId: string): Promise<BetaEvent[]>;
};

const EXPERIMENT_COLUMNS = "id,user_id,source_document_id,source_reference,source_item_key,title,audience_segment,audience_problem,hook,platform,format,cta,intended_outcome,hypothesis,draft,planned_publish_date,variant_label,status,created_at,updated_at";
const PERFORMANCE_COLUMNS = "id,user_id,experiment_id,published_at,views,watch_time_minutes,likes,comments,shares,saves,clicks,signups,revenue,qualified_leads,created_at";

const globals = globalThis as typeof globalThis & { creatorOsMemory?: MemoryStore };

class MemoryStore implements Store {
  profiles = new Map<string, CreatorProfile>();
  sources = new Map<string, SourceDocument[]>();
  experiments = new Map<string, ContentExperiment[]>();
  metrics = new Map<string, PerformanceSnapshot[]>();
  events = new Map<string, BetaEvent[]>();

  async getProfile(userId: string) { return this.profiles.get(userId) ?? null; }
  async saveProfile(userId: string, profile: CreatorProfile) { this.profiles.set(userId, profile); return profile; }
  async listSources(userId: string) { return this.sources.get(userId) ?? []; }
  async getSource(userId: string, id: string) { return (this.sources.get(userId) ?? []).find((source) => source.id === id) ?? null; }
  async addSource(userId: string, source: Omit<SourceDocument, "id" | "createdAt">) { const value = { ...source, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; this.sources.set(userId, [...(this.sources.get(userId) ?? []), value]); return value; }
  async deleteSource(userId: string, id: string) { const existing = this.sources.get(userId) ?? []; const next = existing.filter((source) => source.id !== id); this.sources.set(userId, next); return next.length !== existing.length; }
  async listExperiments(userId: string) { return this.experiments.get(userId) ?? []; }
  async addExperiment(userId: string, experiment: NewExperiment) { const now = new Date().toISOString(); const value = { ...experiment, id: crypto.randomUUID(), status: experiment.status ?? "idea", createdAt: now, updatedAt: now } as ContentExperiment; this.experiments.set(userId, [...(this.experiments.get(userId) ?? []), value]); return value; }
  async updateExperiment(userId: string, id: string, patch: Partial<ContentExperiment>) { const current = (this.experiments.get(userId) ?? []).find((item) => item.id === id); if (!current) return null; const value = { ...current, ...patch, updatedAt: new Date().toISOString() }; this.experiments.set(userId, (this.experiments.get(userId) ?? []).map((item) => item.id === id ? value : item)); return value; }
  async listPerformance(userId: string) { return this.metrics.get(userId) ?? []; }
  async addPerformance(userId: string, metric: Omit<PerformanceSnapshot, "id" | "createdAt">) { const value = { ...metric, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; this.metrics.set(userId, [...(this.metrics.get(userId) ?? []), value]); return value; }
  async trackEvent(userId: string, name: BetaEventName) { this.events.set(userId, [...(this.events.get(userId) ?? []), { name, occurredAt: new Date().toISOString() }]); }
  async listEvents(userId: string) { return this.events.get(userId) ?? []; }
}

function memoryStore() { globals.creatorOsMemory ??= new MemoryStore(); return globals.creatorOsMemory; }

class SupabaseStore implements Store {
  constructor(private readonly client: SupabaseClient) {}

  async getProfile(userId: string) { const { data, error } = await this.client.from("creator_profiles").select("profile").eq("user_id", userId).maybeSingle(); if (error) throw error; return (data?.profile as CreatorProfile | null) ?? null; }
  async saveProfile(userId: string, profile: CreatorProfile) { const { error } = await this.client.from("creator_profiles").upsert({ user_id: userId, profile, updated_at: new Date().toISOString() }); if (error) throw error; return profile; }
  async listSources(userId: string) { const { data, error } = await this.client.from("source_documents").select("id,title,type,content,signals,created_at").eq("user_id", userId).order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normalizeSource); }
  async getSource(userId: string, id: string) { const { data, error } = await this.client.from("source_documents").select("id,title,type,content,signals,created_at").eq("user_id", userId).eq("id", id).maybeSingle(); if (error) throw error; return data ? normalizeSource(data) : null; }
  async addSource(userId: string, source: Omit<SourceDocument, "id" | "createdAt">) { const { data, error } = await this.client.from("source_documents").insert({ user_id: userId, ...source }).select("id,title,type,content,signals,created_at").single(); if (error) throw error; return normalizeSource(data); }
  async deleteSource(userId: string, id: string) { const { error, count } = await this.client.from("source_documents").delete({ count: "exact" }).eq("user_id", userId).eq("id", id); if (error) throw error; return Boolean(count); }
  async listExperiments(userId: string) { const { data, error } = await this.client.from("content_experiments").select(EXPERIMENT_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normalizeExperiment); }
  async addExperiment(userId: string, experiment: NewExperiment) { const { data, error } = await this.client.from("content_experiments").insert({ user_id: userId, ...toDbExperiment(experiment), status: experiment.status ?? "idea" }).select(EXPERIMENT_COLUMNS).single(); if (error) throw error; return normalizeExperiment(data); }
  async updateExperiment(userId: string, id: string, patch: Partial<ContentExperiment>) { const { data, error } = await this.client.from("content_experiments").update({ ...toDbExperiment(patch), updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", id).select(EXPERIMENT_COLUMNS).maybeSingle(); if (error) throw error; return data ? normalizeExperiment(data) : null; }
  async listPerformance(userId: string) { const { data, error } = await this.client.from("performance_snapshots").select(PERFORMANCE_COLUMNS).eq("user_id", userId).order("published_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normalizePerformance); }
  async addPerformance(userId: string, metric: Omit<PerformanceSnapshot, "id" | "createdAt">) { const { data, error } = await this.client.from("performance_snapshots").insert({ user_id: userId, ...toDbPerformance(metric) }).select(PERFORMANCE_COLUMNS).single(); if (error) throw error; return normalizePerformance(data); }
  async trackEvent(userId: string, name: BetaEventName) { const { error } = await this.client.from("beta_events").insert({ user_id: userId, name }); if (error) throw error; }
  async listEvents(userId: string) { const { data, error } = await this.client.from("beta_events").select("name,occurred_at").eq("user_id", userId).order("occurred_at", { ascending: false }); if (error) throw error; return (data ?? []).map((event) => ({ name: event.name as BetaEventName, occurredAt: event.occurred_at })); }
}

function normalizeSource(row: Record<string, unknown>): SourceDocument {
  return { id: row.id as string, title: row.title as string, type: row.type as SourceDocument["type"], content: row.content as string, signals: (row.signals ?? []) as SourceDocument["signals"], createdAt: row.created_at as string };
}

function toDbExperiment(value: Partial<ContentExperiment>) { const { id: _id, sourceDocumentId, sourceReference, sourceItemKey, audienceSegment, audienceProblem, intendedOutcome, plannedPublishDate, variantLabel, createdAt, updatedAt, ...rest } = value; void _id; return { ...rest, source_document_id: sourceDocumentId, source_reference: sourceReference, source_item_key: sourceItemKey, audience_segment: audienceSegment, audience_problem: audienceProblem, intended_outcome: intendedOutcome, planned_publish_date: plannedPublishDate, variant_label: variantLabel, created_at: createdAt, updated_at: updatedAt }; }
function toDbPerformance(value: Partial<PerformanceSnapshot>) { const { id: _id, experimentId, publishedAt, watchTimeMinutes, qualifiedLeads, createdAt, ...rest } = value; void _id; return { ...rest, experiment_id: experimentId, published_at: publishedAt, watch_time_minutes: watchTimeMinutes, qualified_leads: qualifiedLeads, created_at: createdAt }; }
function normalizeExperiment(row: Record<string, unknown>): ContentExperiment { return { id: row.id as string, sourceDocumentId: (row.source_document_id as string | null) ?? null, sourceReference: (row.source_reference as string | null) ?? "", sourceItemKey: (row.source_item_key as string | null) ?? "", title: row.title as string, audienceSegment: row.audience_segment as string, audienceProblem: row.audience_problem as string, hook: row.hook as string, platform: row.platform as string, format: row.format as string, cta: row.cta as string, intendedOutcome: row.intended_outcome as string, hypothesis: row.hypothesis as string, draft: row.draft as string, plannedPublishDate: (row.planned_publish_date as string | null) ?? null, variantLabel: row.variant_label as string, status: row.status as ContentExperiment["status"], createdAt: row.created_at as string, updatedAt: row.updated_at as string }; }
function normalizePerformance(row: Record<string, unknown>): PerformanceSnapshot { return { id: row.id as string, experimentId: row.experiment_id as string, publishedAt: row.published_at as string, views: row.views as number, watchTimeMinutes: (row.watch_time_minutes as number | null) ?? null, likes: row.likes as number, comments: row.comments as number, shares: row.shares as number, saves: row.saves as number, clicks: row.clicks as number, signups: row.signups as number, revenue: row.revenue as number, qualifiedLeads: row.qualified_leads as number, createdAt: row.created_at as string }; }

export function getStore(): Store {
  if (isProductionPersistenceConfigured() && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return new SupabaseStore(createClient(process.env.NEXT_PUBLIC_SUPABASE_URL.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY.trim()));
  }
  if (process.env.NODE_ENV === "production") throw new Error("Production persistence is not configured.");
  return memoryStore();
}

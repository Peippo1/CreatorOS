import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { ContentExperiment, CreatorProfile, PerformanceSnapshot, SourceDocument } from "@/lib/types/product";

type NewExperiment = Omit<ContentExperiment, "id" | "createdAt" | "updatedAt" | "status"> & { status?: ContentExperiment["status"] };
type Store = {
  getProfile(userId: string): Promise<CreatorProfile | null>;
  saveProfile(userId: string, profile: CreatorProfile): Promise<CreatorProfile>;
  listSources(userId: string): Promise<SourceDocument[]>;
  addSource(userId: string, source: Omit<SourceDocument, "id" | "createdAt">): Promise<SourceDocument>;
  listExperiments(userId: string): Promise<ContentExperiment[]>;
  addExperiment(userId: string, experiment: NewExperiment): Promise<ContentExperiment>;
  updateExperiment(userId: string, id: string, patch: Partial<ContentExperiment>): Promise<ContentExperiment | null>;
  listPerformance(userId: string): Promise<PerformanceSnapshot[]>;
  addPerformance(userId: string, metric: Omit<PerformanceSnapshot, "id" | "createdAt">): Promise<PerformanceSnapshot>;
};

const globals = globalThis as typeof globalThis & { creatorOsMemory?: MemoryStore };

class MemoryStore implements Store {
  profiles = new Map<string, CreatorProfile>();
  sources = new Map<string, SourceDocument[]>();
  experiments = new Map<string, ContentExperiment[]>();
  metrics = new Map<string, PerformanceSnapshot[]>();
  async getProfile(userId: string) { return this.profiles.get(userId) ?? null; }
  async saveProfile(userId: string, profile: CreatorProfile) { this.profiles.set(userId, profile); return profile; }
  async listSources(userId: string) { return this.sources.get(userId) ?? []; }
  async addSource(userId: string, source: Omit<SourceDocument, "id" | "createdAt">) { const value = { ...source, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; this.sources.set(userId, [...(this.sources.get(userId) ?? []), value]); return value; }
  async listExperiments(userId: string) { return this.experiments.get(userId) ?? []; }
  async addExperiment(userId: string, experiment: NewExperiment) { const now = new Date().toISOString(); const value = { ...experiment, id: crypto.randomUUID(), status: experiment.status ?? "idea", createdAt: now, updatedAt: now } as ContentExperiment; this.experiments.set(userId, [...(this.experiments.get(userId) ?? []), value]); return value; }
  async updateExperiment(userId: string, id: string, patch: Partial<ContentExperiment>) { const current = (this.experiments.get(userId) ?? []).find((item) => item.id === id); if (!current) return null; const value = { ...current, ...patch, updatedAt: new Date().toISOString() }; this.experiments.set(userId, (this.experiments.get(userId) ?? []).map((item) => item.id === id ? value : item)); return value; }
  async listPerformance(userId: string) { return this.metrics.get(userId) ?? []; }
  async addPerformance(userId: string, metric: Omit<PerformanceSnapshot, "id" | "createdAt">) { const value = { ...metric, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; this.metrics.set(userId, [...(this.metrics.get(userId) ?? []), value]); return value; }
}

function memoryStore() { globals.creatorOsMemory ??= new MemoryStore(); return globals.creatorOsMemory; }

class SupabaseStore implements Store {
  constructor(private readonly client: SupabaseClient) {}
  async getProfile(userId: string) { const { data, error } = await this.client.from("creator_profiles").select("profile").eq("user_id", userId).maybeSingle(); if (error) throw error; return (data?.profile as CreatorProfile | null) ?? null; }
  async saveProfile(userId: string, profile: CreatorProfile) { const { error } = await this.client.from("creator_profiles").upsert({ user_id: userId, profile, updated_at: new Date().toISOString() }); if (error) throw error; return profile; }
  async listSources(userId: string) { const { data, error } = await this.client.from("source_documents").select("id,title,type,content,signals,created_at").eq("user_id", userId).order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map((row) => ({ id: row.id, title: row.title, type: row.type, content: row.content, signals: row.signals ?? [], createdAt: row.created_at } as SourceDocument)); }
  async addSource(userId: string, source: Omit<SourceDocument, "id" | "createdAt">) { const { data, error } = await this.client.from("source_documents").insert({ user_id: userId, ...source }).select("id,title,type,content,signals,created_at").single(); if (error) throw error; return { id: data.id, title: data.title, type: data.type, content: data.content, signals: data.signals ?? [], createdAt: data.created_at } as SourceDocument; }
  async listExperiments(userId: string) { const { data, error } = await this.client.from("content_experiments").select("*").eq("user_id", userId).order("created_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normalizeExperiment); }
  async addExperiment(userId: string, experiment: NewExperiment) { const { data, error } = await this.client.from("content_experiments").insert({ user_id: userId, ...toDbExperiment(experiment), status: experiment.status ?? "idea" }).select("*").single(); if (error) throw error; return normalizeExperiment(data); }
  async updateExperiment(userId: string, id: string, patch: Partial<ContentExperiment>) { const { data, error } = await this.client.from("content_experiments").update({ ...toDbExperiment(patch), updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", id).select("*").maybeSingle(); if (error) throw error; return data ? normalizeExperiment(data) : null; }
  async listPerformance(userId: string) { const { data, error } = await this.client.from("performance_snapshots").select("*").eq("user_id", userId).order("published_at", { ascending: false }); if (error) throw error; return (data ?? []).map(normalizePerformance); }
  async addPerformance(userId: string, metric: Omit<PerformanceSnapshot, "id" | "createdAt">) { const { data, error } = await this.client.from("performance_snapshots").insert({ user_id: userId, ...toDbPerformance(metric) }).select("*").single(); if (error) throw error; return normalizePerformance(data); }
}

function toDbExperiment(value: Partial<ContentExperiment>) { const { id: _id, sourceDocumentId, audienceSegment, audienceProblem, intendedOutcome, plannedPublishDate, variantLabel, createdAt, updatedAt, ...rest } = value; void _id; return { ...rest, source_document_id: sourceDocumentId, audience_segment: audienceSegment, audience_problem: audienceProblem, intended_outcome: intendedOutcome, planned_publish_date: plannedPublishDate, variant_label: variantLabel, created_at: createdAt, updated_at: updatedAt }; }
function toDbPerformance(value: Partial<PerformanceSnapshot>) { const { id: _id, experimentId, publishedAt, watchTimeMinutes, qualifiedLeads, createdAt, ...rest } = value; void _id; return { ...rest, experiment_id: experimentId, published_at: publishedAt, watch_time_minutes: watchTimeMinutes, qualified_leads: qualifiedLeads, created_at: createdAt }; }
function normalizeExperiment(row: Record<string, unknown>): ContentExperiment { return { ...row, sourceDocumentId: row.source_document_id, audienceSegment: row.audience_segment, audienceProblem: row.audience_problem, intendedOutcome: row.intended_outcome, plannedPublishDate: row.planned_publish_date, variantLabel: row.variant_label, createdAt: row.created_at, updatedAt: row.updated_at } as ContentExperiment; }
function normalizePerformance(row: Record<string, unknown>): PerformanceSnapshot { return { ...row, experimentId: row.experiment_id, publishedAt: row.published_at, watchTimeMinutes: row.watch_time_minutes, qualifiedLeads: row.qualified_leads, createdAt: row.created_at } as PerformanceSnapshot; }

export function getStore(): Store {
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) return new SupabaseStore(createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY));
  return memoryStore();
}

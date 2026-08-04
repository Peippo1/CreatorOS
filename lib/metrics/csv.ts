import { performanceSchema, type PerformanceSnapshot } from "@/lib/types/product";

export type CsvImportResult = { rows: Array<Omit<PerformanceSnapshot, "id" | "createdAt">>; errors: string[] };

function parseLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += char;
  }
  if (quoted) throw new Error("Unclosed quoted value");
  cells.push(cell.trim());
  return cells;
}

export function parsePerformanceCsv(input: string): CsvImportResult {
  const lines = input.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { rows: [], errors: ["CSV is empty."] };
  const headers = parseLine(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, "_"));
  if (!headers.includes("experiment_id") || !headers.includes("published_at")) return { rows: [], errors: ["CSV must include experiment_id and published_at columns."] };
  const rows: Array<Omit<PerformanceSnapshot, "id" | "createdAt">> = [];
  const errors: string[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    try {
      const values = parseLine(lines[index]);
      const record: Record<string, string | number> = Object.fromEntries(headers.map((header, cellIndex) => [header, values[cellIndex] ?? ""]));
      const numeric = ["views", "watch_time_minutes", "likes", "comments", "shares", "saves", "clicks", "signups", "revenue", "qualified_leads"];
      for (const key of numeric) if (record[key] === undefined || record[key] === "") delete record[key]; else record[key] = Number(record[key]);
      const parsed = performanceSchema.safeParse({ ...record, experimentId: record.experiment_id, publishedAt: record.published_at, watchTimeMinutes: record.watch_time_minutes, qualifiedLeads: record.qualified_leads });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid row");
      rows.push(parsed.data as Omit<PerformanceSnapshot, "id" | "createdAt">);
    } catch (error) { errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : "Invalid row"}`); }
  }
  return { rows, errors };
}

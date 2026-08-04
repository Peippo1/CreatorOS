"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceDocument } from "@/lib/types/product";

export function DataControls() {
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/sources");
    if (response.ok) setSources((await response.json() as { sources: SourceDocument[] }).sources);
  }

  // This effect owns the initial synchronization with the creator's source list.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  async function exportData() {
    const response = await fetch("/api/export");
    if (!response.ok) { setMessage("Could not export your data."); return; }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "creatoros-export.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Your export has downloaded.");
  }

  async function deleteSource(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/sources/${id}`, { method: "DELETE" });
    if (!response.ok) { setMessage("Could not delete that source."); return; }
    setSources((current) => current.filter((source) => source.id !== id));
    setMessage("Source deleted.");
  }

  return <Card><CardHeader><CardTitle>Data controls</CardTitle><CardDescription>Export your structured workspace or permanently remove source material.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><Button type="button" variant="outline" onClick={() => void exportData()}>Export my data</Button><div className="flex flex-col gap-2">{sources.map((source) => <div key={source.id} className="flex items-center justify-between gap-3 rounded-md border p-3"><div><p className="text-sm font-medium">{source.title}</p><p className="text-xs text-muted-foreground">{source.signals.length} extracted signals</p></div><Button type="button" variant="outline" size="sm" onClick={() => void deleteSource(source.id, source.title)}>Delete</Button></div>)}{!sources.length && <p className="text-sm text-muted-foreground">No source material to manage yet.</p>}</div>{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}</CardContent></Card>;
}

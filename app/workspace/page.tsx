import Link from "next/link";

import { Workspace } from "@/components/workspace";

export const metadata = { title: "Growth Workspace | CreatorOS" };

export default function WorkspacePage() {
  return <main className="min-h-screen"><header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6"><Link href="/" className="font-semibold tracking-tight">CreatorOS</Link><Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground">Build a Growth Pack →</Link></header><section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Creator growth workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Turn content into a learning loop.</h1><p className="mt-3 max-w-2xl text-muted-foreground">Keep the audience evidence, experiments, and outcomes together so CreatorOS can help you decide what to test next.</p></div><Workspace /></section></main>;
}

import Link from "next/link";

import { GenerateWorkspace } from "@/components/generate-workspace";

export const metadata = {
  title: "Build Growth Pack | CreatorOS",
};

export default function GeneratePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md border bg-card text-sm font-semibold">
            C
          </div>
          <span className="text-sm font-semibold tracking-tight">CreatorOS</span>
        </Link>
        <span className="font-mono text-xs text-muted-foreground">
          /generate
        </span>
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-14 pt-8">
        <div className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Build a Creator Growth Pack
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Paste source material, define the audience, and turn raw thinking
            into audience intelligence, content gaps, and platform-aware growth
            experiments.
          </p>
        </div>

        <GenerateWorkspace />
      </section>
    </main>
  );
}

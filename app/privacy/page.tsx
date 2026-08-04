import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to CreatorOS
      </Link>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="text-muted-foreground">Private beta policy · 31 July 2026</p>
      </div>
      <div className="flex flex-col gap-6 text-sm leading-7">
        <p>
          CreatorOS processes the transcript, research notes, niche, platform,
          and audience you submit to generate a Growth Pack. The current beta
          does not save packs or create user accounts.
        </p>
        <p>
          Submitted source material is sent to the configured OpenAI provider
          for generation. Do not submit credentials, confidential information,
          or personal data that you do not have permission to process.
        </p>
        <p>
          We retain only operational request metadata needed to diagnose failed
          requests. We do not log prompts, transcripts, API keys, or generated
          pack content. For privacy questions or deletion requests, contact
          the beta operator before submitting sensitive material.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to CreatorOS
      </Link>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="text-muted-foreground">Private beta terms · 31 July 2026</p>
      </div>
      <div className="flex flex-col gap-6 text-sm leading-7">
        <p>
          CreatorOS is provided as an experimental private beta. Generated
          strategy is advisory, may be inaccurate, and does not guarantee
          audience growth, reach, revenue, or platform performance.
        </p>
        <p>
          You are responsible for the material you submit, including ensuring
          that you have the rights and permissions needed to process it. Review
          and fact-check outputs before publishing or acting on them.
        </p>
        <p>
          Do not use the service to submit secrets, regulated data, or material
          belonging to someone else without permission. Beta access may be
          limited or withdrawn while the product is being evaluated.
        </p>
      </div>
    </main>
  );
}

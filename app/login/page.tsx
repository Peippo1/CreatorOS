"use client";

import Link from "next/link";
import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (turnstileSiteKey && !captchaToken) {
      setMessage("Complete the verification to continue.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(turnstileSiteKey ? { captchaToken } : {}) }),
      });
      const data = await response.json() as { message?: string; error?: string };
      setMessage(data.message ?? data.error ?? "Could not send sign-in link.");
      setCaptchaToken(null);
      setCaptchaVersion((version) => version + 1);
    } catch {
      setMessage("Could not send sign-in link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to CreatorOS</CardTitle>
          <CardDescription>Use your email to receive a secure sign-in link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            {turnstileSiteKey ? <Turnstile key={captchaVersion} siteKey={turnstileSiteKey} options={{ action: "creatoros_login", size: "flexible" }} onSuccess={(token) => { setCaptchaToken(token); setMessage(""); }} onExpire={() => setCaptchaToken(null)} onError={() => { setCaptchaToken(null); setMessage("Verification failed. Please try again."); }} /> : null}
            <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Sending…" : "Send sign-in link"}</Button>
            {message ? <p aria-live="polite" className="text-sm text-muted-foreground">{message}</p> : null}
          </form>
          <Link className="mt-5 block text-sm text-muted-foreground hover:text-foreground" href="/">← Back to CreatorOS</Link>
        </CardContent>
      </Card>
    </main>
  );
}

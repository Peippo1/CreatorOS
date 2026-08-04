"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); setMessage(data.message ?? data.error); }
  return <main className="flex min-h-screen items-center justify-center px-6"><Card className="w-full max-w-md"><CardHeader><CardTitle>Sign in to CreatorOS</CardTitle><CardDescription>Use your email to receive a secure sign-in link.</CardDescription></CardHeader><CardContent><form className="flex flex-col gap-4" onSubmit={submit}><Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><Button type="submit">Send sign-in link</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</form><Link className="mt-5 block text-sm text-muted-foreground hover:text-foreground" href="/">← Back to CreatorOS</Link></CardContent></Card></main>;
}

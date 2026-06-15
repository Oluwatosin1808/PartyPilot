"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { BrutalCard } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { useSupabase } from "@/components/supabase-provider";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase is not configured. Add your public Supabase environment variables.");
      return;
    }

    setLoading(true);
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                full_name: fullName,
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      router.refresh();
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-yellow-300 px-5 py-12">
      <BrutalCard className="w-full max-w-lg bg-white">
        <Link href="/" className="text-2xl font-black">PartyPilot</Link>
        <h1 className="mt-8 text-5xl font-black leading-none">{mode === "signup" ? "Create your pilot seat." : "Welcome back."}</h1>
        <p className="mt-4 text-lg font-bold">
          {mode === "signup" ? "Save AI-generated plans and revisit them later." : "Open your saved event plans."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error ? <p className="rounded-xl border-4 border-black bg-blue-400 p-3 font-black">{error}</p> : null}
          <Button className="w-full" disabled={loading}>{loading ? "Working..." : mode === "signup" ? "Sign Up" : "Login"}</Button>
        </form>

        <div className="mt-6 space-y-3">
          {mode === "login" && (
            <Link href="/forgot-password" className="block text-center font-bold underline">
              Forgot your password?
            </Link>
          )}
          {mode === "signup" ? (
            <LinkButton href="/login" variant="secondary" className="w-full">I Have An Account</LinkButton>
          ) : (
            <LinkButton href="/signup" variant="secondary" className="w-full">Create Account</LinkButton>
          )}
        </div>
      </BrutalCard>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { BrutalCard } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { useSupabase } from "@/components/supabase-provider";

export function ForgotPasswordForm() {
  const router = useRouter();
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-yellow-300 px-5 py-12">
      <BrutalCard className="w-full max-w-lg bg-white">
        <Link href="/" className="text-2xl font-black">PartyPilot</Link>
        <h1 className="mt-8 text-5xl font-black leading-none">Reset your password.</h1>
        <p className="mt-4 text-lg font-bold">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {success ? (
          <div className="mt-8 rounded-xl border-4 border-black bg-green-300 p-6">
            <p className="text-xl font-black">Check your email!</p>
            <p className="mt-2 font-bold">We&apos;ve sent a password reset link to your email address.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            {error ? <p className="rounded-xl border-4 border-black bg-blue-400 p-3 font-black">{error}</p> : null}
            <Button className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
          </form>
        )}

        <div className="mt-6">
          <LinkButton href="/login" variant="secondary" className="w-full">Back to Login</LinkButton>
        </div>
      </BrutalCard>
    </main>
  );
}

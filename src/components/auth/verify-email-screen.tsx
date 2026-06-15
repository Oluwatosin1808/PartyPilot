import Link from "next/link";
import { MailCheck } from "lucide-react";
import { BrutalCard } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export function VerifyEmailScreen({ email }: { email?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-yellow-300 px-5 py-12">
      <BrutalCard className="w-full max-w-lg bg-white">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="text-2xl font-black">PartyPilot</Link>
          <MailCheck className="h-10 w-10 shrink-0" aria-hidden />
        </div>
        <h1 className="mt-8 text-5xl font-black leading-none">Check your email.</h1>
        <p className="mt-4 text-lg font-bold">
          {email ? `We sent a verification link to ${email}.` : "We sent a verification link to your inbox."}
        </p>
        <p className="mt-4 text-base font-bold leading-relaxed">
          Open the message from PartyPilot and confirm your account before logging in. If you do not see it within a minute, check spam or promotions.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <LinkButton href="/login" className="w-full">Go to login</LinkButton>
          <LinkButton href="/signup" variant="secondary" className="w-full">Create another account</LinkButton>
        </div>
      </BrutalCard>
    </main>
  );
}

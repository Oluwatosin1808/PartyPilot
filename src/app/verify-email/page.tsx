import { VerifyEmailScreen } from "@/components/auth/verify-email-screen";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return <VerifyEmailScreen email={params.email} />;
}

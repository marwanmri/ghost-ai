import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectUrl = typeof params.redirect_url === "string" ? params.redirect_url : undefined;
  const decodedUrl = redirectUrl ? decodeURIComponent(redirectUrl) : undefined;

  return (
    <AuthShell>
      <SignIn fallbackRedirectUrl={decodedUrl} />
    </AuthShell>
  );
}

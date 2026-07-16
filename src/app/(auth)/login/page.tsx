import { LoginPageShell } from "@/features/auth/components/login-page-shell";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextValue = resolvedSearchParams?.next;
  const nextPath = Array.isArray(nextValue) ? nextValue[0] : nextValue;

  return <LoginPageShell nextPath={nextPath || "/"} />;
}

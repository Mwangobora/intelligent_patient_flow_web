"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/common/loading-state";

import { useCurrentUserQuery } from "../hooks/use-auth-queries";
import { AuthCard } from "./auth-card";
import { LoginBrandPanel } from "./login-brand-panel";
import { LoginForm } from "./login-form";

type LoginPageShellProps = {
  nextPath: string;
};

export function LoginPageShell({ nextPath }: LoginPageShellProps) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useCurrentUserQuery();

  useEffect(() => {
    if (data) {
      router.replace(nextPath);
    }
  }, [data, nextPath, router]);

  if (isLoading || (isFetching && data)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <LoadingState
          title="Checking your session"
          description="Please wait while we verify whether you are already signed in."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:flex lg:h-screen lg:overflow-hidden">
          <LoginBrandPanel />
        </section>
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:min-h-0 lg:px-14 lg:py-12 xl:px-20">
          <AuthCard
            title="Welcome back"
            description="Sign in to manage hospital patient flow."
          >
            <LoginForm nextPath={nextPath} />
          </AuthCard>
        </section>
      </div>
    </main>
  );
}

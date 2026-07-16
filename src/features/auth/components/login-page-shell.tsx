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
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10">
      <div className="absolute inset-x-0 top-0 h-72 bg-secondary/60" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <section className="order-2 lg:order-1 lg:pr-10">
          <AuthCard
            title="Welcome back"
            description="Sign in to manage hospital patient flow."
          >
            <LoginForm nextPath={nextPath} />
          </AuthCard>
        </section>
        <section className="order-1 lg:order-2">
          <LoginBrandPanel />
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";

import { useCurrentUserQuery } from "../hooks/use-auth-queries";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, isLoading, isFetching, refetch } = useCurrentUserQuery();

  useEffect(() => {
    if (isLoading || isFetching || data) {
      return;
    }

    if (error?.status === 401 || error?.status === 403) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [data, error?.status, isFetching, isLoading, pathname, router]);

  if (isLoading || (isFetching && !data)) {
    return (
      <LoadingState
        title="Checking your session"
        description="Please wait while we verify your hospital workspace access."
      />
    );
  }

  if (!data) {
    if (error?.status === 401 || error?.status === 403) {
      return (
        <LoadingState
          title="Redirecting to sign in"
          description="Your session is not active right now."
        />
      );
    }

    return (
      <ErrorState
        title="Unable to verify your session"
        description="We could not confirm access to the workspace. Please try again."
        actionLabel="Retry"
        onAction={() => void refetch()}
        secondaryActionLabel="Go to login"
        onSecondaryAction={() =>
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        }
      />
    );
  }

  return <>{children}</>;
}

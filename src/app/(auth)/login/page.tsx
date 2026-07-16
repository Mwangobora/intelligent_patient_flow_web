import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="absolute inset-x-0 top-0 h-72 bg-secondary/70" />
      <div className="relative z-10 w-full max-w-md">
        <AuthCard
          title="Welcome back"
          description="Sign in to manage hospital patient flow."
        >
          <LoginForm />
        </AuthCard>
      </div>
    </main>
  );
}

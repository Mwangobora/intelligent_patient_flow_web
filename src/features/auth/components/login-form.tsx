"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { PasswordInputField } from "@/components/forms/password-input-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { getErrorMessage } from "@/lib/api/api-error";

import { useLoginMutation } from "../hooks/use-auth-mutations";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const response = await loginMutation.mutateAsync({
        email_or_phone: values.email,
        password: values.password,
      });
      toast.success(`Welcome back, ${response.user.first_name || response.user.email}.`);
      startTransition(() => router.push("/"));
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormErrorAlert message={formError} />

      <TextInputField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@hospital.org"
        error={errors.email?.message}
        required
        {...register("email")}
      />

      <PasswordInputField
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        required
        {...register("password")}
      />

      <SubmitButton
        label="Sign in"
        loadingLabel="Signing in..."
        isLoading={loginMutation.isPending}
      />
    </form>
  );
}

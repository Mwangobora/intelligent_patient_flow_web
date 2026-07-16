import { AlertTriangle } from "lucide-react";

type FormErrorAlertProps = {
  message?: string | null;
};

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

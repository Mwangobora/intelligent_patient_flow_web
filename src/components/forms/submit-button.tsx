import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
};

export function SubmitButton({
  label,
  loadingLabel = "Submitting...",
  isLoading = false,
}: SubmitButtonProps) {
  return (
    <Button className="w-full" type="submit" disabled={isLoading}>
      {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? loadingLabel : label}
    </Button>
  );
}

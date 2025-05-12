import { ReactNode } from "react";

interface FormFieldErrorProps {
  error?: string;
}

export function FormFieldError({ error }: FormFieldErrorProps) {
  return (
    <div className="min-h-[20px]">
      <span className="text-xs text-destructive">{error}</span>
    </div>
  );
}

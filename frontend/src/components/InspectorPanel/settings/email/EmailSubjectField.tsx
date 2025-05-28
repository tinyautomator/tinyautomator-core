import { useFormContext } from "react-hook-form";
import {
  EmailFormValues,
  MAX_SUBJECT_CHAR_COUNT,
} from "./utils/emailValidation";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps } from "react-hook-form";

interface EmailSubjectFieldProps
  extends ControllerRenderProps<EmailFormValues, "subject"> {}

export function EmailSubjectField({ ...field }: EmailSubjectFieldProps) {
  const {
    watch,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const subject = watch("subject") || "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-1">
      <Input
        {...field}
        onKeyDown={handleKeyDown}
        aria-invalid={!!errors.subject}
      />
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {subject.length}/{MAX_SUBJECT_CHAR_COUNT} characters
        </span>
      </div>
    </div>
  );
}

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

import {
  EmailFormValues,
  MAX_MESSAGE_CHAR_COUNT as maxBodyLength,
} from "./utils/emailValidation";
import { ControllerRenderProps } from "react-hook-form";

interface EmailBodyFieldProps
  extends ControllerRenderProps<EmailFormValues, "message"> {}

export function EmailBodyField({ ...field }: EmailBodyFieldProps) {
  const {
    watch,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const message = watch("message") || "";

  return (
    <div className="space-y-1">
      <Textarea {...field} aria-invalid={!!errors.message} />
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {message.length}/{maxBodyLength} characters
        </span>
      </div>
    </div>
  );
}

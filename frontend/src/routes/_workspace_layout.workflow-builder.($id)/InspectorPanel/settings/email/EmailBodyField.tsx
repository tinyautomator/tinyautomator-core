import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  EmailFormValues,
  MAX_MESSAGE_CHAR_COUNT as maxBodyLength,
} from "./utils/emailValidation";

export function EmailBodyField() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const message = watch("message") || "";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Message</label>
      <div className="space-y-1">
        <Textarea {...register("message")} aria-invalid={!!errors.message} />
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {message.length}/{maxBodyLength} characters
          </span>
        </div>
      </div>
    </div>
  );
}

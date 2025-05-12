import { useFormContext } from "react-hook-form";
import {
  EmailFormValues,
  MAX_SUBJECT_CHAR_COUNT,
} from "./utils/emailValidation";
import { Input } from "@/components/ui/input";

export function EmailSubjectField() {
  const {
    register,
    watch,

    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const subject = watch("subject") || "";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Subject</label>
      <div className="space-y-1">
        <Input {...register("subject")} aria-invalid={!!errors.subject} />
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {subject.length}/{MAX_SUBJECT_CHAR_COUNT} characters
          </span>
        </div>
      </div>
    </div>
  );
}

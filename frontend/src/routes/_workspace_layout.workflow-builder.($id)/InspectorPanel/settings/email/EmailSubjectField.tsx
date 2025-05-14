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

<<<<<<< HEAD
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

=======
>>>>>>> 02799ac (feat: send-email block with new inputs and toasts for different ui interactions)
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Subject</label>
      <div className="space-y-1">
<<<<<<< HEAD
        <Input
          {...register("subject")}
          aria-invalid={!!errors.subject}
          onKeyDown={handleKeyDown}
        />
=======
        <Input {...register("subject")} aria-invalid={!!errors.subject} />
>>>>>>> 02799ac (feat: send-email block with new inputs and toasts for different ui interactions)
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {subject.length}/{MAX_SUBJECT_CHAR_COUNT} characters
          </span>
        </div>
      </div>
    </div>
  );
}

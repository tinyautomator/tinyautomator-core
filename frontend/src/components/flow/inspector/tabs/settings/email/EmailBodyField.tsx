import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { EmailFormValues } from "./utils/emailValidation";
import { MAX_MESSAGE_CHAR_COUNT } from "./utils/emailValidation";
export function EmailBodyField() {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const body = watch("message");
  const maxBodyLength = MAX_MESSAGE_CHAR_COUNT;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex justify-between">Body</label>
      <div className="w-full grid grid-cols gap-4">
        {errors.message && (
          <p className="text-red-500 text-sm">{errors.message.message}</p>
        )}
        <Textarea
          id="email-body"
          className="w-full min-h-[150px] text-sm font-mono resize-y"
          maxLength={maxBodyLength}
          {...register("message")}
          wrap="soft"
        />
      </div>
      <p className="text-xs text-right text-muted-foreground">
        {maxBodyLength - body.length} characters remaining
      </p>
    </div>
  );
}

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { EmailFormValues } from "./utils/emailValidation";

export function EmailSubjectField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Subject</label>
      {errors.subject && (
        <p className="text-red-500 text-sm">{errors.subject.message}</p>
      )}
      <Input
        type="text"
        {...register("subject")}
        className="w-full"
        placeholder="Email subject"
      />
    </div>
  );
}

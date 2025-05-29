import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControllerRenderProps } from "react-hook-form";

export function RecipientInputField({
  ...field
}: ControllerRenderProps<EmailFormValues, "recipients">) {
  const {
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const [inputValue, setInputValue] = useState("");

  const handleAdd = (email: string) => {
    if (!email) return;
    field.onChange([...field.value.filter((e) => e !== email), email]);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab" && inputValue.trim() === "") {
      return;
    }
    if (["Enter", ",", "Tab"].includes(e.key)) {
      handleAdd(inputValue);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    if (/\s/.test(pastedText)) {
      e.preventDefault();
      const newEmails = pastedText.split(/[\s,]+/).map((email) => email.trim());

      const newEmailsSet = new Set([...field.value, ...newEmails]);
      field.onChange(Array.from(newEmailsSet));
      setInputValue("");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type or paste email addresses"
          aria-invalid={!!errors.recipients}
        />
        <Button
          type="button"
          size="icon"
          onClick={() => handleAdd(inputValue)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

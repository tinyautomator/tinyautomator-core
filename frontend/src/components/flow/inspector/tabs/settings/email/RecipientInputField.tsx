"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext, Controller } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";

export function RecipientInputField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const [inputValue, setInputValue] = useState("");

  return (
    <Controller
      control={control}
      name="recipients"
      render={({ field: { value, onChange } }) => {
        const handleAdd = (email: string) => {
          const trimmed = email.trim().toLowerCase();
          if (!trimmed) return;

          const normalizedExisting = value.map((e) => e.toLowerCase());
          if (normalizedExisting.includes(trimmed)) return;

          onChange([...value, trimmed]);
          setInputValue("");
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (["Enter", "Tab", ","].includes(e.key)) {
            e.preventDefault();
            handleAdd(inputValue);
          }
        };

        const handlePaste = (e: React.ClipboardEvent) => {
          const pastedText = e.clipboardData.getData("text");
          if (pastedText.includes(",")) {
            e.preventDefault();
            pastedText
              .split(",")
              .map((email) => email.trim())
              .forEach((email) => email && handleAdd(email));
          }
        };

        return (
          <>
            {errors.recipients && (
              <p className="text-red-500 text-sm">
                {errors.recipients.message}
              </p>
            )}
            <Input
              type="recipients"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => inputValue && handleAdd(inputValue)}
              onPaste={handlePaste}
              placeholder="Add email..."
              className="w-full"
            />
          </>
        );
      }}
    />
  );
}

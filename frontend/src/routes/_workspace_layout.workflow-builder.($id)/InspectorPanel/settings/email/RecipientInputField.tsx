"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";
import { useEmailRecipe } from "./utils/useEmailRecipe";

export function RecipientInputField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const { addEmail } = useEmailRecipe();
  const [inputValue, setInputValue] = useState("");

  register("recipients");

  const handleAdd = (email: string) => {
    addEmail(email);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (["Enter", ","].includes(e.key)) {
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
    <div className="space-y-2">
      <label className="text-sm font-medium">Add Recipients</label>
      <div className="space-y-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type or paste email addresses"
          aria-invalid={!!errors.recipients}
        />
      </div>
    </div>
  );
}

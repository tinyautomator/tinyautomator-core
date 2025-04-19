// components/EmailChips.tsx
"use client";

import type React from "react";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCallback, useState, useRef, useEffect } from "react";
import { validateEmail as defaultValidateEmail } from "./utils/emailValidation";

interface EmailChipsProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  validateEmail?: (email: string) => boolean;
  placeholder?: string;
}

export function EmailChips({
  emails,
  onEmailsChange,
  validateEmail = defaultValidateEmail,
  placeholder = "Add email...",
}: EmailChipsProps) {
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when emails change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [emails]);

  const handleAdd = useCallback(
    (email: string) => {
      if (!email.trim()) return;

      const newEmails = Array.from(new Set([...emails, email.trim()]));
      onEmailsChange(newEmails);
      setInputValue("");
    },
    [emails, onEmailsChange],
  );

  const handleRemove = useCallback(
    (emailToRemove: string) => {
      onEmailsChange(emails.filter((email) => email !== emailToRemove));
    },
    [emails, onEmailsChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="email-scroll max-h-40 overflow-y-auto flex flex-wrap gap-2 p-1 border rounded-md"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        <style>{`
        .email-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .email-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .email-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; /* Tailwind slate-300 */
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
          transition: background-color 0.2s ease;
        }
        .email-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8; /* Tailwind slate-400 */
        }

        .email-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>

        {emails.map((email) => {
          const isValid = validateEmail(email);
          return (
            <Badge
              key={email}
              variant={isValid ? "default" : "destructive"}
              className={`flex items-center gap-1 py-1 ${
                !isValid
                  ? "bg-red-200 text-red-800 border border-red-500 hover:bg-red-200 hover:text-red-900"
                  : ""
              }`}
            >
              {email}
              <button
                onClick={() => handleRemove(email)}
                className="ml-1 rounded-full hover:bg-white/10"
                aria-label={`Remove ${email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      <Input
        type="email"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue && handleAdd(inputValue)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (pasted.includes(",")) {
            e.preventDefault();
            pasted.split(",").forEach((email) => handleAdd(email.trim()));
          }
        }}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}

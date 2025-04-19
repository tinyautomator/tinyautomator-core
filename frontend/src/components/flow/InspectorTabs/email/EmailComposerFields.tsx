// components/email/EmailComposerFields.tsx
"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useEmailComposer } from "./hooks/useEmailComposer";
import { availableVariables } from "./utils/emailTemplates";

const MAX_CHARS = 2500;

export function EmailComposerFields() {
  const { subject, setSubject, body, setBody } = useEmailComposer();

  const insertVariable = (variableId: string) => {
    const variable = `{{${variableId}}}`;
    const textarea = document.getElementById(
      "email-body",
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        textarea.value.slice(0, start) + variable + textarea.value.slice(end);
      setBody(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd =
          start + variable.length;
      }, 0);
    } else {
      setBody(body + variable);
    }
  };

  return (
    <div className="space-y-4">
      {/* Subject */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border p-2 rounded-md text-sm"
          placeholder="Email subject"
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex justify-between">
          Body
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add Variable
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              {availableVariables.map((v) => (
                <button
                  key={v.id}
                  onClick={() => insertVariable(v.id)}
                  className="block w-full text-left px-3 py-1 hover:bg-slate-100 text-sm"
                >
                  {v.name}
                  <span className="text-xs text-muted-foreground ml-1">{`{{${v.id}}}`}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </label>

        <Textarea
          id="email-body"
          className="w-full min-h-[150px] text-sm font-mono"
          maxLength={MAX_CHARS}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="text-xs text-right text-muted-foreground">
          {MAX_CHARS - body.length} characters remaining
        </p>
      </div>
    </div>
  );
}

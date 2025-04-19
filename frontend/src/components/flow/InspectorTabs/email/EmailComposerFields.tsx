// components/email/EmailComposerFields.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { useEmailComposer } from "./hooks/useEmailComposer";

const MAX_CHARS = 2500;

export function EmailComposerFields() {
  const { subject, setSubject, body, setBody } = useEmailComposer();

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
        <label className="text-sm font-medium flex justify-between">Body</label>

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

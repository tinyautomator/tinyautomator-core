"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { replaceVariables } from "./email/utils/emailTemplates";
import type { Node } from "@xyflow/react";

import { ManualEmailInput } from "./email/ManualEmailInput";
import { CsvEmailInput } from "./email/CsvEmailInput";
import { EmailComposerFields } from "./email/EmailComposerFields";
import { useEmailManager } from "./email/hooks/useEmailManager";
import { useEmailComposer } from "./email/hooks/useEmailComposer";

interface SettingsTabProps {
  node: Node<{ label: string }>;
}

const MAX_PREVIEW_EMAILS = 3;

export default function SettingsTab({ node }: SettingsTabProps) {
  const {
    isLoading,
    isDragging,
    error,
    setIsDragging,
    handleCsvFile,
    emails,
    emailString,
    inputMode,
    setInputModeWithReset,
    addEmails,
    clearEmails,
  } = useEmailManager();

  const { subject, body } = useEmailComposer();

  const [previewOpen, setPreviewOpen] = useState(false);

  const formatPreviewEmails = (emails: string): string => {
    const emailList = emails.split(/,\s*/).filter(Boolean);
    if (emailList.length <= MAX_PREVIEW_EMAILS) return emails;

    return `${emailList.slice(0, MAX_PREVIEW_EMAILS).join(", ")} ... (${
      emailList.length - MAX_PREVIEW_EMAILS
    } more)`;
  };

  return (
    <div className="space-y-4">
      {node.data.label === "Send Email" && (
        <>
          {/* Recipient Input Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient Input Mode</label>
            <Select value={inputMode} onValueChange={setInputModeWithReset}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select input mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="csv">Upload CSV</SelectItem>
                <SelectItem value="google" disabled>
                  Import from Google Sheets (coming soon)
                </SelectItem>
                <SelectItem value="contacts" disabled>
                  Use Saved Contact List (coming soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional input based on selected mode */}
          {inputMode === "manual" && (
            <ManualEmailInput
              emails={emails.map((e) => e.email)}
              onEmailsChange={(newList) => {
                clearEmails();
                addEmails(newList);
              }}
            />
          )}

          {inputMode === "csv" && (
            <CsvEmailInput
              emails={emails.map((e) => e.email)}
              addEmails={addEmails}
              clearEmails={clearEmails}
              isLoading={isLoading}
              error={error}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              handleCsvFile={handleCsvFile}
            />
          )}

          {inputMode === "google" && (
            <p className="text-sm text-slate-500 italic">
              Import from Google Sheets will be available soon.
            </p>
          )}

          {inputMode === "contacts" && (
            <p className="text-sm text-slate-500 italic">
              Saved Contact Lists will be available soon.
            </p>
          )}

          {/* Subject + Body input */}
          <EmailComposerFields />

          {/* Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-6">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
              </DialogHeader>
              <div className="p-4 bg-white border rounded-md space-y-2 text-sm">
                <p>
                  <strong>To:</strong>{" "}
                  {formatPreviewEmails(replaceVariables(emailString))}
                </p>
                <p>
                  <strong>Subject:</strong> {replaceVariables(subject)}
                </p>
                <p>{replaceVariables(body)}</p>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {node.data.label === "Time Trigger" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule Type</label>
            <select className="w-full rounded-md border border-slate-200 p-2 text-sm">
              <option>Interval</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Custom Cron</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Run Every</label>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue="15"
                className="w-20 rounded-md border border-slate-200 p-2 text-sm"
              />
              <select className="flex-1 rounded-md border border-slate-200 p-2 text-sm">
                <option>Minutes</option>
                <option>Hours</option>
                <option>Days</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

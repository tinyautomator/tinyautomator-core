import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  replaceVariables,
  emailTemplates,
  availableVariables,
} from "../utils/emailTemplates";
import type { Node } from "@xyflow/react";

interface SettingsTabProps {
  node: Node<{ label: string }>;
}

const MAX_CHARS = 2500;

export default function SettingsTab({ node }: SettingsTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [EmailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleTemplateChange = (id: string) => {
    const template = emailTemplates.find((t) => t.id === id);
    if (!template) return;
    setSelectedTemplate(id);
    setEmailTo(template.to);
    setEmailSubject(template.subject);
    setEmailBody(template.body);
  };

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
      setEmailBody(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd =
          start + variable.length;
      }, 0);
    } else {
      setEmailBody((prev) => prev + variable);
    }
  };

  return (
    <div className="space-y-4">
      {node.data.label === "Send Email" && (
        <>
          {/* Template dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Template</label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* To input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <input
              type="email"
              value={EmailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="w-full border p-2 rounded-md text-sm"
              placeholder="recipient@example.com"
            />
          </div>

          {/* Subject input + Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full border p-2 rounded-md text-sm"
              placeholder="Email subject"
            />
          </div>

          {/* Body with variable insert */}
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
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
            <p className="text-xs text-right text-muted-foreground">
              {MAX_CHARS - emailBody.length} characters remaining
            </p>
          </div>
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
                  <strong>To:</strong> {replaceVariables(EmailTo)}
                </p>
                <p>
                  <strong>Subject:</strong> {replaceVariables(emailSubject)}
                </p>
                <p>{replaceVariables(emailBody)}</p>
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

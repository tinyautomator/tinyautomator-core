import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { parseEmail } from "./utils/emailValidation";
import { ControllerRenderProps } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";

function RecipientChip({
  recipient,
  isValid,
  onUpdate,
  onRemove,
}: {
  recipient: string;
  isValid: boolean;
  onUpdate: (oldEmail: string, newEmail: string) => void;
  onRemove: (email: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(recipient);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    const parsed = parseEmail(editValue);
    if (!parsed) {
      onUpdate(recipient, editValue);
      return;
    }
    onUpdate(recipient, parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(recipient);
    }
  };

  if (isEditing) {
    return (
      <Badge
        variant={isValid ? "default" : "destructive"}
        className="flex items-center gap-1 py-1"
      >
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-5 bg-transparent border-none p-0 w-32 focus:outline-none focus:ring-0"
          aria-label="Edit email address"
        />
        <button
          type="button"
          onClick={handleSave}
          className="ml-1 rounded-full hover:bg-white/10"
          aria-label="Save changes"
        >
          <Check className="h-3 w-3 text-white" />
        </button>
      </Badge>
    );
  }

  return (
    <Badge
      variant={isValid ? "default" : "destructive"}
      className="flex items-center gap-1 py-1"
    >
      {recipient}
      <button
        onClick={handleEdit}
        className="ml-1 rounded-full hover:bg-white/10"
        aria-label={`Edit ${recipient}`}
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={() => onRemove(recipient)}
        className="ml-1 rounded-full hover:bg-white/10"
        aria-label={`Remove ${recipient}`}
      >
        ✕
      </button>
    </Badge>
  );
}

export function RecipientChips({
  ...field
}: ControllerRenderProps<EmailFormValues, "recipients">) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { validRecipients, invalidRecipients } = field.value.reduce(
    (acc, email) => {
      const isValid = parseEmail(email) !== null;
      if (isValid) {
        acc.validRecipients.push(email);
      } else {
        acc.invalidRecipients.push(email);
      }
      return acc;
    },
    { validRecipients: [] as string[], invalidRecipients: [] as string[] },
  );

  const handleUpdate = (oldRecipient: string, newRecipient: string) => {
    const newValue = field.value.map((recipient) =>
      recipient === oldRecipient ? newRecipient : recipient,
    );
    field.onChange(newValue);
  };

  const handleRemove = (recipient: string) => {
    field.onChange(field.value.filter((r) => r !== recipient));
  };

  return field.value.length > 0 ? (
    <div
      ref={containerRef}
      className="recipient-scroll max-h-40 overflow-y-auto flex flex-wrap gap-2 p-1 border rounded-md"
    >
      {validRecipients.map((recipient) => (
        <RecipientChip
          key={recipient}
          recipient={recipient}
          isValid={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      ))}
      {invalidRecipients.map((recipient) => (
        <RecipientChip
          key={recipient}
          recipient={recipient}
          isValid={false}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      ))}
    </div>
  ) : (
    <div className="text-sm text-muted-foreground"></div>
  );
}

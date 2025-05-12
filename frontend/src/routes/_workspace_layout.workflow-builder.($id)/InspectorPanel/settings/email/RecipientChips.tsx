import { Badge } from "@/components/ui/badge";
import { validateEmail } from "./utils/emailValidation";
import { useRef, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEmailRecipe } from "./utils/useEmailRecipe";

function RecipientChip({
  recipient,
  isValid,
}: {
  recipient: string;
  isValid: boolean;
}) {
  const { updateEmail, removeEmail } = useEmailRecipe();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(recipient);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    updateEmail(recipient, editValue);
    setIsEditing(false);
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
        className={`flex items-center gap-1 py-1 ${
          !isValid ? "bg-red-200 text-red-800 border border-red-500" : ""
        }`}
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
      </Badge>
    );
  }

  return (
    <Badge
      variant={isValid ? "default" : "destructive"}
      className={`flex items-center gap-1 py-1 ${
        !isValid ? "bg-red-200 text-red-800 border border-red-500" : ""
      }`}
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
        onClick={() => removeEmail(recipient)}
        className="ml-1 rounded-full hover:bg-white/10"
        aria-label={`Remove ${recipient}`}
      >
        ✕
      </button>
    </Badge>
  );
}

export function RecipientChips() {
  const { recipients } = useEmailRecipe();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [recipients]);

  return (
    <div
      ref={containerRef}
      className="recipient-scroll max-h-40 overflow-y-auto flex flex-wrap gap-2 p-1 border rounded-md"
    >
      {recipients.map((recipient) => {
        const isValid = validateEmail(recipient);
        return (
          <RecipientChip
            key={recipient}
            recipient={recipient}
            isValid={isValid}
          />
        );
      })}
    </div>
  );
}

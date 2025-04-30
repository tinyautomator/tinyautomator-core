import { useFormContext } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";
import { Badge } from "@/components/ui/badge";
import { validateEmail } from "./utils/emailValidation";
import { useRef, useEffect } from "react";

export function RecipientChips() {
  const { watch, setValue } = useFormContext<EmailFormValues>();
  const recipients = watch("recipients");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [recipients]);

  const handleRemove = (recipientToRemove: string) => {
    setValue(
      "recipients",
      recipients.filter((recipient) => recipient !== recipientToRemove),
    );
  };

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
            handleRemove={handleRemove}
          />
        );
      })}
    </div>
  );
}
interface RecipientChipProps {
  recipient: string;
  isValid: boolean;
  handleRemove: (recipient: string) => void;
}

function RecipientChip({
  recipient,
  isValid,
  handleRemove,
}: RecipientChipProps) {
  return (
    <Badge
      key={recipient}
      variant={isValid ? "default" : "destructive"}
      className={`flex items-center gap-1 py-1 ${
        !isValid ? "bg-red-200 text-red-800 border border-red-500" : ""
      }`}
    >
      {recipient}
      <button
        onClick={() => handleRemove(recipient)}
        className="ml-1 rounded-full hover:bg-white/10"
        aria-label={`Remove ${recipient}`}
      >
        ✕
      </button>
    </Badge>
  );
}

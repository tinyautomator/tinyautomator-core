import { Badge } from '@/components/ui/badge';
import { useRef, useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEmailRecipients } from './utils/useEmailRecipents';

function RecipientChip({ recipient, isValid }: { recipient: string; isValid: boolean }) {
  const { updateEmail, removeEmail } = useEmailRecipients();
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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(recipient);
    }
  };

  if (isEditing) {
    return (
      <Badge variant={isValid ? 'default' : 'destructive'} className="flex items-center gap-1 py-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
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
    <Badge variant={isValid ? 'default' : 'destructive'} className="flex items-center gap-1 py-1">
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
  const { validRecipients, invalidRecipients } = useEmailRecipients();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="recipient-scroll max-h-40 overflow-y-auto flex flex-wrap gap-2 p-1 border rounded-md"
    >
      {validRecipients.map(recipient => (
        <RecipientChip key={recipient} recipient={recipient} isValid={true} />
      ))}
      {invalidRecipients.map(recipient => (
        <RecipientChip key={recipient} recipient={recipient} isValid={false} />
      ))}
    </div>
  );
}

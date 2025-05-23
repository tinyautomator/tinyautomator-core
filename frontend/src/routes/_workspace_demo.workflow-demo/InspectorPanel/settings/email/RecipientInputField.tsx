import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EmailFormValues } from './utils/emailValidation';
import { useEmailRecipients } from './utils/useEmailRecipents';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecipientInputField() {
  const {
    formState: { errors },
  } = useFormContext<EmailFormValues>();
  const { addEmail } = useEmailRecipients();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (email: string) => {
    addEmail(email);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (/\s/.test(pastedText)) {
      e.preventDefault();
      pastedText
        .split(/[\s,]+/)
        .map(email => email.trim())
        .filter(Boolean)
        .forEach(email => handleAdd(email));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Add Recipients</label>
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type or paste email addresses"
            aria-invalid={!!errors.recipients}
          />
          <Button
            type="button"
            size="icon"
            onClick={() => handleAdd(inputValue)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

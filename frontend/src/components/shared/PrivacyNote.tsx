import { Shield } from 'lucide-react';
import { ReactNode } from 'react';

interface PrivacyNoteProps {
  title?: string;
  children: ReactNode;
}

export const PrivacyNote = ({ title = 'Your data stays private', children }: PrivacyNoteProps) => (
  <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-800 flex items-start gap-2">
    <Shield className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
    <div>
      <p className="font-medium">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  </div>
);

'use client';

import { createContext, useContext } from 'react';
import { useEmailIntegration } from './useEmailIntegration';

const EmailIntegrationContext = createContext<ReturnType<typeof useEmailIntegration> | null>(null);

export function EmailIntegrationProvider({ children }: { children: React.ReactNode }) {
  const integration = useEmailIntegration();
  return (
    <EmailIntegrationContext.Provider value={integration}>
      {children}
    </EmailIntegrationContext.Provider>
  );
}

export function useEmailIntegrationContext() {
  const ctx = useContext(EmailIntegrationContext);
  if (!ctx) {
    throw new Error('useEmailIntegrationContext must be used within EmailIntegrationProvider');
  }
  return ctx;
}

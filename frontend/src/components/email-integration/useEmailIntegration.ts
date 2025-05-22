import { useState } from 'react';
import { fetchGmailAuthUrl } from './fetchGmailAuthUrl';

export const useEmailIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const connectGmail = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const url = await fetchGmailAuthUrl();
      setAuthUrl(url);
      window.open(url, 'gmail-auth-popup', 'width=500,height=600,top=100,left=100');
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    authUrl,
    errorMessage,
    connectGmail,
  };
};

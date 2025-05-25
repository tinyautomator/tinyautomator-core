import { useEffect, useState } from "react";
import { fetchGmailAuthUrl } from "./fetchGmailAuthUrl";

function isGmailConnected() {
  const hasCookie = document.cookie
    .split(";")
    .some((c) => c.trim().startsWith("gmail_token="));
  return hasCookie;
}

export const useEmailIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connected = isGmailConnected();
    setIsConnected(connected);
  }, []);

  const connectGmail = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const url = await fetchGmailAuthUrl();
      setAuthUrl(url);
      const popup = window.open(
        url,
        "gmail-auth-popup",
        "width=500,height=600,top=100,left=100",
      );

      // Poll for popup close and re-check cookie
      const poll = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(poll);
          const connected = isGmailConnected();
          setIsConnected(connected);
        }
      }, 500);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unknown error occurred");
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
    isConnected,
  };
};

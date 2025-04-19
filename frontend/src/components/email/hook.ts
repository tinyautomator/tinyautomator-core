import { useState, useEffect } from "react";
import { fetchGmailAuthUrl } from "./api";

export const useEmailIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connected" | "error"
  >("disconnected");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Replace with real check later
    setConnectionStatus("disconnected");
  }, []);

  const connectGmail = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const url = await fetchGmailAuthUrl();
      setAuthUrl(url);
      window.open(url, "_blank");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGmail = async () => {
    setIsLoading(true);
    try {
      setConnectionStatus("disconnected");
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
    connectionStatus,
    errorMessage,
    connectGmail,
    disconnectGmail,
  };
};

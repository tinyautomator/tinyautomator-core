export const fetchGmailAuthUrl = async () => {
  const res = await fetch("/api/integrations/gmail/auth-url");
  const data = await res.json();
  if (!data.url) throw new Error("No auth URL");
  return data.url;
};

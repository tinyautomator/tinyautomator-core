import { gmailApi } from "@/api";

export const fetchGmailAuthUrl = async () => {
  const res = await gmailApi.getAuthUrl();
  if (!res.url) throw new Error("No auth URL");
  return res.url;
};

// utils/csvParser.ts
import Papa from "papaparse";

interface CsvParseResult {
  emails: string[];
  error: string | null;
}

export const parseEmailCsv = (file: File): Promise<CsvParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Common column names for email fields
        const emailColumns = ["email", "e-mail", "mail", "email address"];

        // Find the first email column that exists
        const emailField =
          results.meta.fields?.find((f) =>
            emailColumns.includes(f.toLowerCase()),
          ) || results.meta.fields?.[0];

        if (!emailField) {
          return resolve({
            emails: [],
            error: "No valid email column found in CSV",
          });
        }

        // Extract and clean emails
        const emails = (results.data as Record<string, unknown>[])
          .map((row) => {
            const raw = row[emailField];
            if (typeof raw === "string") return raw.trim();
            if (raw !== null && raw !== undefined) return String(raw).trim();
            return "";
          })
          .filter((email) => email.length > 0);

        resolve({ emails, error: null });
      },
      error: (error) => {
        resolve({
          emails: [],
          error: error.message || "Failed to parse CSV file",
        });
      },
    });
  });
};

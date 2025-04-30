import Papa from "papaparse";

import { validateEmail } from "./emailValidation";

export async function parseEmailCsv(file: File) {
  try {
    const text = await file.text();

    const result = Papa.parse<string[]>(text, {
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      return {
        emails: [],
        error: `CSV parse error: ${result.errors[0].message}`,
      };
    }
    const emails = result.data
      .flat()
      .map((email) => email.trim().toLowerCase())
      .filter((email) => validateEmail(email));

    if (emails.length == 0) {
      return {
        emails: [],
        error: "No valid emails in this file error",
      };
    }
    return { emails, error: null };
  } catch (error) {
    return {
      emails: [],
      error:
        error instanceof Error
          ? `Error parsing CSV: ${error.message}`
          : "Unknown error parsing CSV",
    };
  }
}

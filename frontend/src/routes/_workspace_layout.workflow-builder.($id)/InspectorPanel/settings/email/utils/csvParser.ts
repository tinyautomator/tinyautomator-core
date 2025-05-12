import Papa from "papaparse";

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

    const emails = result.data.flat().filter((email) => email.trim());

    if (emails.length === 0) {
      return {
        emails: [],
        error: "No emails found in this file",
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

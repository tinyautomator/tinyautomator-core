export const availableVariables = [
  { id: "firstName", name: "First Name", value: "John" },
  { id: "lastName", name: "Last Name", value: "Doe" },
  { id: "email", name: "Email", value: "john.doe@example.com" },
  { id: "company", name: "Company", value: "Acme Inc." },
  { id: "role", name: "Role", value: "Product Manager" },
  { id: "date", name: "Current Date", value: new Date().toLocaleDateString() },
  { id: "time", name: "Current Time", value: new Date().toLocaleTimeString() },
];

export const emailTemplates = [
  {
    id: "welcome",
    to: "new_member@gmail.com",
    name: "Welcome Email",
    subject: "Welcome to {{company}}, {{firstName}}!",
    body: "Hello {{firstName}},\n\nWelcome to {{company}}! We're excited to have you on board.\n\nBest,\n{{company}} Team",
  },
  {
    id: "follow-up",
    to: "team_member1@gmail.com, team_member2@gmail.com",
    name: "Meeting Follow-up",
    subject: "Follow-up: Our Meeting on {{date}}",
    body: "Hi {{firstName}},\n\nThank you for meeting today.\n\nNext steps:\n1. Do X\n2. Do Y\n\n- {{company}} Team",
  },
  {
    id: "custom",
    to: "",
    name: "Custom Template",
    subject: "",
    body: "",
  },
];

export function replaceVariables(text: string): string {
  return availableVariables.reduce((result, v) => {
    return result.replace(new RegExp(`{{${v.id}}}`, "g"), v.value);
  }, text);
}

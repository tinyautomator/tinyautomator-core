import { z } from "zod";
export const emailTriggerSchema = z.object({
  historyType: z.enum(
    ["messageAdded", "messageDeleted", "labelAdded", "labelDeleted"],
    {
      errorMap: () => ({ message: "Please select an event action" }),
    },
  ),
  keywords: z.string().optional(),
  labelIds: z.array(z.string()).optional(),
});
export const emailTriggerDefaultValues: Partial<EmailTriggerSchema> = {};

export type EmailTriggerSchema = z.infer<typeof emailTriggerSchema>;

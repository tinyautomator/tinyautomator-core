import type { Workflow } from "../../route";

const workflowTemplates = [
  {
    title: "Email Marketing Campaign",
    description: "Automated email sequence for new subscribers",
    tags: ["marketing", "email", "paid"],
  },
  {
    title: "Social Media Post Scheduler",
    description: "Schedule posts across multiple platforms",
    tags: ["social", "scheduled", "free"],
  },
  {
    title: "Customer Onboarding",
    description: "Welcome sequence for new customers",
    tags: ["onboarding", "email", "paid"],
  },
  {
    title: "Data Backup Automation",
    description: "Daily backup of critical data",
    tags: ["backup", "scheduled", "free"],
  },
  {
    title: "Lead Nurturing Sequence",
    description: "Follow-up sequence for potential customers",
    tags: ["marketing", "email", "paid"],
  },
];

const statuses = ["active", "draft", "archived", "templates"] as const;

function generateMoreWorkflows(count: number): Workflow[] {
  return Array.from({ length: count }, (_, index) => {
    const template = workflowTemplates[index % workflowTemplates.length];
    const number = Math.floor(index / workflowTemplates.length) + 1;
    return {
      id: Math.random(),
      title: `${template.title} ${number}`,
      description: template.description,
      lastEdited: new Date(
        Date.now() - Math.random() * 10000000000
      ).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      nodeCount: Math.floor(Math.random() * 20) + 5,
      tags: [...template.tags],
    };
  });
}

// Generate 50 workflows for good pagination testing
export const sampleWorkflows: Workflow[] = generateMoreWorkflows(1000);

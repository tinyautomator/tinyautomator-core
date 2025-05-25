import type { Workflow } from "../../route";

const workflowTemplates = [
  {
    title: "Email Marketing",
    description:
      "Automated email sequence for new subscribers with personalized content and A/B testing",
    tags: ["marketing", "email", "automation", "paid"],
    status: "active",
  },
  {
    title: "Social Media Posts",
    description:
      "Schedule and auto-post content across multiple social platforms with analytics tracking",
    tags: ["social", "scheduled", "automation", "free"],
    status: "active",
  },
  {
    title: "Customer Onboarding",
    description:
      "Streamlined welcome sequence for new customers with interactive tutorials",
    tags: ["onboarding", "email", "customer-success", "paid"],
    status: "draft",
  },
  {
    title: "Data Backup ",
    description:
      "Secure daily backup of critical data with encryption and cloud storage",
    tags: ["backup", "scheduled", "security", "free"],
    status: "templates",
  },
  {
    title: "Lead Nurturing Sequence",
    description:
      "Multi-touch follow-up sequence for potential customers with engagement tracking",
    tags: ["marketing", "email", "sales", "paid"],
    status: "archived",
  },
  {
    title: "Invoice Processing",
    description:
      "Automated invoice generation, approval, and payment processing workflow",
    tags: ["finance", "automation", "paid"],
    status: "active",
  },
  {
    title: "HR Document Management",
    description:
      "Streamline employee document collection and verification process",
    tags: ["hr", "documents", "compliance", "paid"],
    status: "draft",
  },
  {
    title: "Support Ticket Router",
    description:
      "Intelligent routing of support tickets based on priority and expertise",
    tags: ["support", "automation", "ai", "paid"],
    status: "templates",
  },
  {
    title: "Content Approval Flow",
    description:
      "Multi-step content review and approval process with notifications",
    tags: ["content", "approval", "collaboration", "free"],
    status: "archived",
  },
  {
    title: "Inventory Management",
    description:
      "Real-time inventory tracking and automated reorder processing",
    tags: ["inventory", "automation", "alerts", "paid"],
    status: "active",
  },
];

const statuses = ["active", "draft", "archived", "templates"] as const;

function generateMoreWorkflows(count: number): Workflow[] {
  return Array.from({ length: count }, (_, index) => {
    const template = workflowTemplates[index % workflowTemplates.length];
    const number = Math.floor(index / workflowTemplates.length) + 1;

    // Add some randomization to make data more diverse
    const randomDays = Math.floor(Math.random() * 30);
    const randomHours = Math.floor(Math.random() * 24);
    const lastEdited = new Date();
    lastEdited.setDate(lastEdited.getDate() - randomDays);
    lastEdited.setHours(lastEdited.getHours() - randomHours);

    // For workflows beyond the first set, mix up the statuses more randomly
    const status =
      number === 1
        ? template.status
        : statuses[Math.floor(Math.random() * statuses.length)];

    // Add some random additional tags occasionally
    const extraTags =
      Math.random() > 0.7
        ? [["beta", "new", "featured"][Math.floor(Math.random() * 3)]]
        : [];

    return {
      id: Math.random(),
      title: number === 1 ? template.title : `${template.title} ${number}`,
      description: template.description,
      lastEdited: lastEdited.toISOString(),
      status: status as Workflow["status"],
      nodeCount: Math.floor(Math.random() * 30) + 5,
      tags: [...template.tags, ...extraTags],
    };
  });
}

// Generate 100 workflows for good testing
export const sampleWorkflows: Workflow[] = generateMoreWorkflows(1000);

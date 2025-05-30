export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateWorkflowDto {
  name: string;
  description: string;
  status: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateWorkflowDto {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type Config = { [key: string]: string | number | boolean | Config };

export interface WorkflowNode extends Record<string, unknown> {
  id: string;
  category: string;
  node_type: string;
  config: Config;
  position: {
    x: number;
    y: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
}

export interface RenderedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowRun {
  workflow_id: string;
  workflow_name: string;
  workflow_run_id: string;
  status: string;
  created_at: string;
  finished_at?: string;
}

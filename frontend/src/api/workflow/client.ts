import { BaseApiClient } from "../base";
import {
  Workflow,
  CreateWorkflowDto,
  RenderedWorkflow,
  UpdateWorkflowDto,
  WorkflowRun,
} from "./types";

export class WorkflowApiClient extends BaseApiClient {
  async getUserWorkflows(): Promise<Workflow[]> {
    return await this.get<Workflow[]>("/api/workflow");
  }

  async renderWorkflow(id: string): Promise<RenderedWorkflow> {
    return await this.get(`/api/workflow/${id}/render`);
  }

  async createWorkflow(data: CreateWorkflowDto): Promise<number> {
    console.log("createWorkflow", data);
    return await this.post<number>("/api/workflow", data);
  }

  async updateWorkflow(id: string, data: UpdateWorkflowDto): Promise<void> {
    console.log("updateWorkflow", data);
    return await this.put(`/api/workflow/${id}`, data);
  }

  async runWorkflow(id: string): Promise<number> {
    console.log("runWorkflow", id);
    const res = await this.post<{ run_id: number }>(`/api/workflow-run/${id}`);
    return res.run_id;
  }

  async getUserWorkflowRuns(): Promise<WorkflowRun[]> {
    return await this.get<WorkflowRun[]>(`/api/workflow-runs`);
  }

  async archiveWorkflow(id: string): Promise<void> {
    console.log("archiveWorkflow", id);
    return await this.patch(`/api/workflow/${id}/archive`);
  }
}

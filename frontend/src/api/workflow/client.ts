import { BaseApiClient } from "../base";
import {
  Workflow,
  CreateWorkflowDto,
  RenderedWorkflow,
  UpdateWorkflowDto,
} from "./types";

export class WorkflowApiClient extends BaseApiClient {
  async getUserWorkflows(): Promise<Workflow[]> {
    return await this.get<Workflow[]>("/api/workflow");
  }

  async renderWorkflow(id: string): Promise<RenderedWorkflow> {
    return await this.get(`/api/workflow/${id}/render`);
  }

  async createWorkflow(data: CreateWorkflowDto): Promise<number> {
    console.log(data);
    return await this.post<number>("/api/workflow", data);
  }

  async updateWorkflow(id: string, data: UpdateWorkflowDto): Promise<void> {
    console.log(data);
    return await this.put(`/api/workflow/${id}`, data);
  }

  async runWorkflow(id: string): Promise<void> {
    return await this.post(`/api/workflow-run/${id}`);
  }

  async archiveWorkflow(id: string): Promise<void> {
    return await this.patch(`/api/workflow/${id}/archive`);
  }
}

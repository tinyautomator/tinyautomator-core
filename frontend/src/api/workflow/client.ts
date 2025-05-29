import { BaseApiClient } from "../base";
import {
  Workflow,
  CreateWorkflowDto,
  RenderedWorkflow,
  UpdateWorkflowDto,
  WorkflowRun,
} from "./types";

export class WorkflowApiClient extends BaseApiClient {
  async getUserWorkflows(authToken?: string): Promise<Workflow[]> {
    return await this.get<Workflow[]>("/api/workflow", authToken);
  }

  async renderWorkflow(
    id: string,
    authToken?: string,
  ): Promise<RenderedWorkflow> {
    return await this.get(`/api/workflow/${id}/render`, authToken);
  }

  async createWorkflow(
    data: CreateWorkflowDto,
    authToken?: string,
  ): Promise<number> {
    console.log("createWorkflow", data);
    return await this.post<number>("/api/workflow", authToken, data);
  }

  async updateWorkflow(
    id: string,
    data: UpdateWorkflowDto,
    authToken?: string,
  ): Promise<void> {
    console.log("updateWorkflow", data);
    return await this.put(`/api/workflow/${id}`, authToken, data);
  }

  async runWorkflow(id: string, authToken?: string): Promise<number> {
    console.log("runWorkflow", id);
    const res = await this.post<{ run_id: number }>(
      `/api/workflow-run/${id}`,
      authToken,
      {},
    );
    return res.run_id;
  }

  async getUserWorkflowRuns(authToken?: string): Promise<WorkflowRun[]> {
    return await this.get<WorkflowRun[]>(`/api/workflow-runs`, authToken);
  }

  async archiveWorkflow(id: string, authToken?: string): Promise<void> {
    console.log("archiveWorkflow", id);
    return await this.patch(`/api/workflow/${id}/archive`, authToken);
  }
}

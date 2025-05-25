import { workflowApi } from "@/api";
import { Route } from "./+types/route";
import CanvasBody, { NodeBuilder } from "@/components/Canvas/CanvasBody";
import InspectorPanel from "@/components/InspectorPanel";
import { Separator } from "@/components/ui/separator";
import CanvasHeader from "@/components/Canvas/CanvasHeader";
import { useLayoutContext } from "../_workspace_layout._workflow_canvas/useLayoutContext";
import { useEffect, useRef } from "react";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { MarkerType } from "@xyflow/react";

// Define the expected structure of the NodeStatusUpdate data from the server
// This should match the 'redisclient.NodeStatusUpdate' struct on your Go backend
interface NodeStatusUpdate {
  runId: string | number; // Match the type from your backend (string or int32)
  nodeId: string | number; // Match the type
  status: string;
  timestamp: string;
  details?: Record<string, Record<string, string>>;
}

interface ConnectionEstablishedData {
  message: string;
  runId: string | number;
}

export async function loader({ params }: Route.LoaderArgs) {
  const res = await workflowApi.renderWorkflow(params.workflowID as string);
  return {
    workflowRun: res,
    runId: params.runID,
  };
}

export default function WorkflowRun({
  loaderData: { workflowRun, runId },
}: Route.ComponentProps) {
  const setNodes = useFlowStore((s) => s.setNodes);
  const setEdges = useFlowStore((s) => s.setEdges);
  const setNodeStatus = useFlowStore((s) => s.setNodeStatus);
  const { toggleInspectorPanel, setToggleInspectorPanel } = useLayoutContext();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setToggleInspectorPanel(false);
    if (workflowRun) {
      const parsedNodes = workflowRun.nodes.map((n) => {
        return NodeBuilder(n.id, n.position, n.action_type);
      });

      setNodes(parsedNodes);
      setEdges(
        workflowRun.edges?.map((edge) => ({
          ...edge,
          id: edge.id,
          source: edge.source_node_id,
          target: edge.target_node_id,
          animated: true,
          style: { stroke: "#60a5fa" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#60a5fa",
          },
        })),
      );

      const sseUrl = `http://localhost:9000/api/workflow-run/${runId}/progress`;
      console.log(`Attempting to connect to SSE: ${sseUrl}`);

      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE Connection opened.");
      };

      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        eventSource.close();
      };

      eventSource.addEventListener("connection_established", (event) => {
        try {
          const parsedData: ConnectionEstablishedData = JSON.parse(event.data);
          console.log("Connection established event:", parsedData);
        } catch (e) {
          console.error(
            "Failed to parse connection_established event data:",
            event.data,
            e,
          );
        }
      });

      eventSource.addEventListener("node_update", (event) => {
        try {
          const parsedData: NodeStatusUpdate = JSON.parse(event.data);
          console.log("Node update event:", parsedData);
          setNodeStatus(parsedData.nodeId as string, parsedData.status);
        } catch (e) {
          console.error(
            "Failed to parse node_update event data:",
            event.data,
            e,
          );
        }
      });

      eventSource.addEventListener("heartbeat", (event) => {
        console.log("Heartbeat event:", event.data);
      });

      eventSource.addEventListener("workflow_run_completed", (event) => {
        console.log("Workflow run completed event:", event.data);
        eventSource.close();
        parsedNodes.forEach((node) => {
          setNodeStatus(node.id, "success");
        });
      });

      eventSource.onmessage = (event) => {
        console.log("Generic SSE message:", event.data);
      };

      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
          console.log(
            "SSE Connection closed due to component unmount or runId change.",
          );
        }
      };
    }
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 bg-slate-50 flex flex-col">
        <CanvasHeader workflow={workflowRun} />
        <Separator />
        <CanvasBody />
      </div>
      <InspectorPanel
        toggleInspectorPanel={toggleInspectorPanel}
        setToggleInspectorPanel={setToggleInspectorPanel}
      />
    </div>
  );
}

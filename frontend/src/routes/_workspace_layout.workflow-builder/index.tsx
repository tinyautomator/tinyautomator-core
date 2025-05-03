import { ReactFlowProvider } from "@xyflow/react";
import "../../App.css";
import "@xyflow/react/dist/style.css";
import BlockPanel from "./BlockPanel";
import CanvasBody from "./CanvasBody";
import CanvasHeader from "./CanvasHeader";
import InspectorPanel from "./InspectorPanel";
import { FlowProvider } from "./FlowContext";

export default function WorkflowBuilder() {
  return (
    <div className="flex h-full">
      <ReactFlowProvider>
        <FlowProvider>
          <BlockPanel />
          <div className="flex-1 bg-slate-50">
            <CanvasHeader />
            <div className="flex-1 h-full">
              <CanvasBody />
            </div>
          </div>
          <InspectorPanel />
        </FlowProvider>
      </ReactFlowProvider>
    </div>
  );
}

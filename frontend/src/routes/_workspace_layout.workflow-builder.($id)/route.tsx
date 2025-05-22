import { MarkerType, useReactFlow } from '@xyflow/react';
import '../../App.css';
import '@xyflow/react/dist/style.css';
import BlockPanel from './BlockPanel';
import InspectorPanel from './InspectorPanel';
import { Route } from './+types/route';
import { Separator } from '@/components/ui/separator';
import CanvasBody, { NodeBuilder } from './CanvasBody';
import CanvasHeader from './CanvasHeader';
import { workflowApi } from '@/api';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useFlowStore } from './flowStore';
import WorkspaceTutorial from './workspaceTutorial';
import { Button } from '@/components/ui/button';

export async function loader({ params }: Route.LoaderArgs) {
  if (params.id) {
    const workflowToEdit = await workflowApi.renderWorkflow(params.id);
    console.log('workflowToEdit', workflowToEdit);
    workflowToEdit?.nodes?.forEach(node => {
      console.log(node.data);
    });
    return workflowToEdit;
  }
}

export default function WorkflowBuilder({ loaderData: workflowToEdit }: Route.ComponentProps) {
  const setNodes = useFlowStore(s => s.setNodes);
  const setEdges = useFlowStore(s => s.setEdges);
  const [toggleBlockPanel, setToggleBlockPanel] = useState(true);
  const [toggleInspectorPanel, setToggleInspectorPanel] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const { open, setOpen } = useSidebar();
  const { fitView } = useReactFlow();

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      const isTextInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.key === '/' && !isTextInput) {
        e.preventDefault();
        setToggleBlockPanel(true);
        setSearchFocused(true);
        setTimeout(() => {
          fitView({
            duration: 500,
            minZoom: 0.5,
            maxZoom: 1.5,
          });
        }, 500);
      } else if (e.key === 'f' && !isTextInput) {
        e.preventDefault();
        const isFullscreen = !(toggleBlockPanel || toggleInspectorPanel || open);

        setOpen(isFullscreen);
        setToggleInspectorPanel(isFullscreen);
        setToggleBlockPanel(isFullscreen);
        setTimeout(() => {
          fitView({
            duration: 500,
            minZoom: 0.5,
            maxZoom: 1.5,
          });
        }, 500);
      }
    },
    [open, toggleBlockPanel, toggleInspectorPanel, fitView, setOpen]
  );

  useEffect(() => {
    setOpen(false);
    setTimeout(() => {
      fitView({
        duration: 500,
        minZoom: 0.5,
        maxZoom: 1.5,
      });
    }, 500);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (workflowToEdit) {
      const parsedNodes = workflowToEdit.nodes.map(n => {
        return NodeBuilder(n.id, n.position, n.action_type);
      });

      setNodes(parsedNodes);
      setEdges(
        workflowToEdit.edges?.map(edge => ({
          ...edge,
          id: edge.id,
          source: edge.source_node_id,
          target: edge.target_node_id,
          animated: true,
          style: { stroke: '#60a5fa' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#60a5fa',
          },
        }))
      );
    }
  }, [workflowToEdit, setNodes, setEdges]);

  const [tutorialRun, setTutorialRun] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      <>
        <Button className="absolute bottom-4 left-100 z-50" onClick={() => setTutorialRun(true)}>
          Start Tutorial
        </Button>

        <WorkspaceTutorial run={tutorialRun} onFinish={() => setTutorialRun(false)} />
      </>
      <div
        className={cn(
          'transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 flex flex-col h-full max-w-72',
          toggleBlockPanel ? 'w-72 pointer-events-auto' : 'w-0 pointer-events-none'
        )}
      >
        <BlockPanel
          searchFocused={searchFocused}
          setSearchFocused={setSearchFocused}
          blockPanelOpen={toggleBlockPanel}
        />
      </div>
      <div className="flex-1 bg-slate-50 flex flex-col">
        <CanvasHeader
          workflowToEdit={workflowToEdit}
          onCollapseToggle={() => setToggleBlockPanel(open => !open)}
          collapsed={!toggleBlockPanel}
        />
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

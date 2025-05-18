import { buttonVariants } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { NavLink } from "react-router";

export function CreateWorkflowButton() {
  return (
    <NavLink to="/workflow-builder" className={buttonVariants()}>
      <PlusCircleIcon className="h-4 w-4" />
      <span>Create Workflow</span>
    </NavLink>
  );
}

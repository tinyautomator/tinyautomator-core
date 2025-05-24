import { workflowApi } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Settings } from "lucide-react";
import { NavLink } from "react-router";

interface WorkflowCardProps {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  status: string;
  runs: number;
}

export function WorkflowCard({
  id,
  name,
  description,
  lastRun,
  status,
  runs,
}: WorkflowCardProps) {

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          <Badge variant={status === "active" ? "default" : "outline"}>
            {status === "active" ? "Active" : "Paused"}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Last run: {lastRun}</div>
          <div className="font-medium">{runs} runs</div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              workflowApi.runWorkflow(id);
            }}
          >
            <Play className="mr-1 h-3 w-3" />
            Run Now
          </Button>
          <NavLink
            to={`/workflow-builder/${id}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <Settings className="mr-1 h-3 w-3" />
            Configure
          </NavLink>
        </div>
      </CardFooter>
    </Card>
  );
}

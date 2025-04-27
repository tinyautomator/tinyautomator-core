import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Settings } from "lucide-react";

interface WorkflowCardProps {
  title: string;
  description: string;
  lastRun: string;
  status: string;
  runs: number;
}

export function WorkflowCard({
  title,
  description,
  lastRun,
  status,
  runs,
}: WorkflowCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
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
          <Button variant="outline" size="sm">
            <Play className="mr-1 h-3 w-3" />
            Run Now
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="mr-1 h-3 w-3" />
            Configure
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

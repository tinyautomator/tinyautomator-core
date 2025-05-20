// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import * as echarts from "echarts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface WorkflowSummaryCardProps {
  id: string;
  title: string;
  description?: string;
  tags: Tag[];
  status: "active" | "paused" | "draft" | "error";
  nodeCount: number;
  lastUpdated: string;
  lastRun?: string;
  successRate?: number;
  author?: {
    name: string;
    avatar?: string;
  };
  isLoading?: boolean;
  isStarred?: boolean;
  isNew?: boolean;
  onEdit?: (id: string) => void;
  onRun?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
  onStar?: (id: string, starred: boolean) => void;
}

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-emerald-100 text-emerald-700",
    icon: "fa-solid fa-circle-check",
  },
  paused: {
    label: "Paused",
    color: "bg-amber-100 text-amber-700",
    icon: "fa-solid fa-pause",
  },
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700",
    icon: "fa-solid fa-file-lines",
  },
  error: {
    label: "Error",
    color: "bg-rose-100 text-rose-700",
    icon: "fa-solid fa-triangle-exclamation",
  },
};

const WorkflowSummaryCard: React.FC<WorkflowSummaryCardProps> = ({
  id,
  title,
  description,
  tags,
  status,
  nodeCount,
  lastUpdated,
  lastRun,
  successRate,
  author,
  isLoading = false,
  isStarred = false,
  isNew = false,
  onEdit,
  onRun,
  onDuplicate,
  onArchive,
  onStar,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [starred, setStarred] = useState(isStarred);
  const visibleTags = tags.slice(0, 3);
  const hiddenTagsCount = Math.max(0, tags.length - 3);

  const handleAction = (action: "edit" | "run" | "duplicate" | "archive") => {
    switch (action) {
      case "edit":
        onEdit?.(id);
        break;
      case "run":
        onRun?.(id);
        break;
      case "duplicate":
        onDuplicate?.(id);
        break;
      case "archive":
        onArchive?.(id);
        break;
      default:
        break;
    }
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStarred(!starred);
    onStar?.(id, !starred);
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[280px] p-5 transition-all duration-200 overflow-hidden bg-white border border-slate-200">
        <div className="flex justify-between items-start mb-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-4/5 mb-5" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </Card>
    );
  }

  return (
    <Card
      className={`w-full h-[280px] p-5 transition-all duration-300 overflow-hidden relative bg-white border ${
        isHovered ? "shadow-lg border-blue-200" : "shadow-sm border-slate-200"
      } flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* New badge */}
      {isNew && (
        <div className="absolute top-0 right-0">
          <div className="bg-blue-600 text-white text-xs font-bold py-1 px-3 transform rotate-45 translate-x-[18px] translate-y-[-10px] shadow-sm">
            NEW
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start">
          <button
            onClick={handleStar}
            className="mr-2 text-lg text-slate-400 hover:text-yellow-400 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
          >
            <i
              className={`${starred ? "fa-solid text-yellow-400" : "fa-regular"} fa-star`}
            ></i>
          </button>
          <h3
            className="font-bold text-lg text-slate-800 line-clamp-2 pr-2 hover:text-blue-600 cursor-pointer"
            onClick={() => handleAction("edit")}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer !rounded-button whitespace-nowrap">
              <i className="fa-solid fa-ellipsis-vertical text-slate-600"></i>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => handleAction("edit")}
                className="cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i className="fa-solid fa-pen-to-square mr-2 text-blue-600"></i>{" "}
                Edit Workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("run")}
                className="cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i className="fa-solid fa-play mr-2 text-emerald-600"></i> Run
                Now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("duplicate")}
                className="cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i className="fa-solid fa-copy mr-2 text-purple-600"></i>{" "}
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("archive")}
                className="cursor-pointer text-rose-600 !rounded-button whitespace-nowrap"
              >
                <i className="fa-solid fa-box-archive mr-2"></i> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status and node count */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[status].color}`}
        >
          <i className={`${statusConfig[status].icon} text-xs`}></i>
          <span>{statusConfig[status].label}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200 !rounded-button whitespace-nowrap"
              >
                <i className="fa-solid fa-diagram-project mr-1.5"></i>
                {nodeCount} {nodeCount === 1 ? "Node" : "Nodes"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total nodes in workflow</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Description section - optional */}
      {description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-grow">
          {description}
        </p>
      )}

      {/* Tags section */}
      <div className="flex flex-wrap gap-2 mb-3">
        {visibleTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="text-xs py-1 px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 !rounded-button whitespace-nowrap"
          >
            {tag.name}
          </Badge>
        ))}
        {hiddenTagsCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="text-xs py-1 px-2.5 bg-slate-50 text-slate-500 border-slate-200 !rounded-button whitespace-nowrap"
                >
                  +{hiddenTagsCount} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  {tags.slice(3).map((tag) => (
                    <p key={tag.id} className="text-sm">
                      {tag.name}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Success rate if available */}
      {typeof successRate === "number" && (
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-600">Success Rate</span>
            <span
              className={`font-medium ${successRate >= 90 ? "text-emerald-600" : successRate >= 70 ? "text-amber-600" : "text-rose-600"}`}
            >
              {successRate}%
            </span>
          </div>
          <Progress
            value={successRate}
            className="h-1.5"
            indicatorClassName={`${successRate >= 90 ? "bg-emerald-500" : successRate >= 70 ? "bg-amber-500" : "bg-rose-500"}`}
          />
        </div>
      )}

      {/* Footer section */}
      <div className="mt-auto pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <i className="fa-regular fa-clock mr-1.5"></i>
            <span>Updated {lastUpdated}</span>
            {lastRun && (
              <>
                <span className="mx-1.5">•</span>
                <span>Last run {lastRun}</span>
              </>
            )}
          </div>

          {author && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-6 w-6">
                    {author.avatar ? (
                      <AvatarImage src={author.avatar} alt={author.name} />
                    ) : (
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Created by {author.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Quick action buttons on hover */}
      {isHovered && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-5 pt-10 transform translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 !rounded-button whitespace-nowrap"
              onClick={() => handleAction("edit")}
            >
              <i className="fa-solid fa-pen-to-square mr-1.5"></i> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 !rounded-button whitespace-nowrap"
              onClick={() => handleAction("run")}
            >
              <i className="fa-solid fa-play mr-1.5"></i> Run
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Enhanced sample data
const sampleWorkflows = [
  {
    id: "1",
    title: "Customer Onboarding Process",
    description:
      "Automates the entire customer onboarding journey from signup to welcome email sequence.",
    tags: [
      { id: "1", name: "Customer Success" },
      { id: "2", name: "Email" },
      { id: "3", name: "Onboarding" },
      { id: "4", name: "High Priority" },
    ],
    status: "active" as const,
    nodeCount: 12,
    lastUpdated: "2 days ago",
    lastRun: "3 hours ago",
    successRate: 98,
    author: {
      name: "Alex Morgan",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20business%20person%20with%20short%20hair%20and%20confident%20expression%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=1&orientation=squarish",
    },
    isStarred: true,
    isNew: false,
  },
  {
    id: "2",
    title: "Lead Qualification Workflow",
    description:
      "Scores and qualifies incoming leads based on behavior and profile data.",
    tags: [
      { id: "5", name: "Marketing" },
      { id: "6", name: "Lead Generation" },
      { id: "7", name: "Scoring" },
    ],
    status: "paused" as const,
    nodeCount: 8,
    lastUpdated: "5 days ago",
    lastRun: "2 days ago",
    successRate: 85,
    author: {
      name: "Jamie Chen",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20asian%20business%20person%20with%20glasses%20and%20friendly%20smile%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=2&orientation=squarish",
    },
    isStarred: false,
    isNew: false,
  },
  {
    id: "3",
    title: "Support Ticket Escalation",
    description:
      "Automatically routes and escalates support tickets based on priority and SLA requirements.",
    tags: [
      { id: "8", name: "Support" },
      { id: "9", name: "Escalation" },
      { id: "14", name: "SLA" },
    ],
    status: "error" as const,
    nodeCount: 5,
    lastUpdated: "Yesterday",
    lastRun: "12 hours ago",
    successRate: 62,
    author: {
      name: "Taylor Swift",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20business%20woman%20with%20long%20blonde%20hair%20and%20confident%20expression%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=3&orientation=squarish",
    },
    isStarred: false,
    isNew: false,
  },
  {
    id: "4",
    title: "Social Media Content Calendar",
    description:
      "Schedules and publishes content across multiple social platforms.",
    tags: [
      { id: "10", name: "Social Media" },
      { id: "11", name: "Content" },
      { id: "12", name: "Scheduling" },
      { id: "13", name: "Marketing" },
    ],
    status: "draft" as const,
    nodeCount: 15,
    lastUpdated: "1 week ago",
    author: {
      name: "Jordan Lee",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20business%20person%20with%20dark%20skin%20and%20professional%20attire%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=4&orientation=squarish",
    },
    isStarred: false,
    isNew: true,
  },
  {
    id: "5",
    title: "Inventory Restock Alert System",
    description:
      "Monitors inventory levels and triggers restock alerts when products reach threshold levels.",
    tags: [
      { id: "15", name: "Inventory" },
      { id: "16", name: "Alerts" },
      { id: "17", name: "Supply Chain" },
    ],
    status: "active" as const,
    nodeCount: 9,
    lastUpdated: "3 days ago",
    lastRun: "6 hours ago",
    successRate: 94,
    author: {
      name: "Sam Wilson",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20middle%20aged%20business%20man%20with%20beard%20and%20glasses%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=5&orientation=squarish",
    },
    isStarred: true,
    isNew: false,
  },
  {
    id: "6",
    title: "Customer Feedback Analysis",
    description:
      "Collects and analyzes customer feedback from multiple channels using sentiment analysis.",
    tags: [
      { id: "18", name: "Feedback" },
      { id: "19", name: "Analytics" },
      { id: "20", name: "AI" },
    ],
    status: "active" as const,
    nodeCount: 18,
    lastUpdated: "1 day ago",
    lastRun: "1 day ago",
    successRate: 91,
    author: {
      name: "Riley Johnson",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20business%20person%20with%20red%20hair%20and%20freckles%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=6&orientation=squarish",
    },
    isStarred: false,
    isNew: true,
  },
];

// Sample templates for the template gallery
const workflowTemplates = [
  {
    id: "t1",
    title: "Customer Onboarding",
    description:
      "A complete workflow for onboarding new customers with email sequences and task assignments.",
    category: "Customer Success",
    complexity: "Medium",
    estimatedSetupTime: "30 min",
    popularity: 4.8,
    image:
      "https://readdy.ai/api/search-image?query=abstract%20visualization%20of%20a%20customer%20journey%20map%20with%20connected%20nodes%20and%20pathways%2C%20blue%20gradient%20background%2C%20professional%20business%20concept%20illustration%2C%20clean%20modern%20design&width=600&height=300&seq=7&orientation=landscape",
  },
  {
    id: "t2",
    title: "Lead Nurturing Campaign",
    description:
      "Automatically nurture leads with personalized content based on their behavior and interests.",
    category: "Marketing",
    complexity: "Advanced",
    estimatedSetupTime: "45 min",
    popularity: 4.6,
    image:
      "https://readdy.ai/api/search-image?query=abstract%20visualization%20of%20a%20marketing%20funnel%20with%20flowing%20data%20and%20connection%20points%2C%20purple%20gradient%20background%2C%20professional%20business%20concept%20illustration%2C%20clean%20modern%20design&width=600&height=300&seq=8&orientation=landscape",
  },
  {
    id: "t3",
    title: "Support Ticket Routing",
    description:
      "Route support tickets to the right team based on content analysis and priority.",
    category: "Support",
    complexity: "Simple",
    estimatedSetupTime: "15 min",
    popularity: 4.9,
    image:
      "https://readdy.ai/api/search-image?query=abstract%20visualization%20of%20a%20support%20ticket%20system%20with%20connected%20nodes%20and%20routing%20paths%2C%20teal%20gradient%20background%2C%20professional%20business%20concept%20illustration%2C%20clean%20modern%20design&width=600&height=300&seq=9&orientation=landscape",
  },
];

// Analytics data for charts
const analyticsData = {
  executionsByDay: [42, 38, 52, 48, 62, 59, 73],
  successRateByDay: [92, 88, 95, 91, 97, 94, 98],
  topWorkflows: [
    { name: "Customer Onboarding", executions: 245 },
    { name: "Lead Qualification", executions: 187 },
    { name: "Support Escalation", executions: 156 },
    { name: "Content Calendar", executions: 134 },
    { name: "Feedback Analysis", executions: 112 },
  ],
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [executionsChart, setExecutionsChart] =
    useState<echarts.ECharts | null>(null);
  const [successRateChart, setSuccessRateChart] =
    useState<echarts.ECharts | null>(null);
  const [topWorkflowsChart, setTopWorkflowsChart] =
    useState<echarts.ECharts | null>(null);

  // Filter workflows based on search and tab
  const filteredWorkflows = sampleWorkflows.filter((workflow) => {
    const matchesSearch =
      searchTerm === "" ||
      workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workflow.description &&
        workflow.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      workflow.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "active")
      return matchesSearch && workflow.status === "active";
    if (selectedTab === "draft")
      return matchesSearch && workflow.status === "draft";
    if (selectedTab === "starred") return matchesSearch && workflow.isStarred;

    return matchesSearch;
  });

  const handleAction = (action: string, id: string) => {
    console.log(`${action} workflow with id: ${id}`);
  };

  const handleStarWorkflow = (id: string, starred: boolean) => {
    console.log(`${starred ? "Starred" : "Unstarred"} workflow with id: ${id}`);
  };

  // Initialize charts
  useEffect(() => {
    // Executions chart
    if (document.getElementById("executions-chart")) {
      const executionsChartInstance = echarts.init(
        document.getElementById("executions-chart")
      );
      const executionsOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#64748b",
          },
          splitLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
        },
        series: [
          {
            name: "Executions",
            type: "bar",
            data: analyticsData.executionsByDay,
            itemStyle: {
              color: "#3b82f6",
            },
            emphasis: {
              itemStyle: {
                color: "#2563eb",
              },
            },
            barWidth: "60%",
          },
        ],
      };
      executionsChartInstance.setOption(executionsOption);
      setExecutionsChart(executionsChartInstance);
    }

    // Success rate chart
    if (document.getElementById("success-rate-chart")) {
      const successRateChartInstance = echarts.init(
        document.getElementById("success-rate-chart")
      );
      const successRateOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
          },
        },
        yAxis: {
          type: "value",
          min: 80,
          max: 100,
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#64748b",
            formatter: "{value}%",
          },
          splitLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
        },
        series: [
          {
            name: "Success Rate",
            type: "line",
            data: analyticsData.successRateByDay,
            itemStyle: {
              color: "#10b981",
            },
            lineStyle: {
              width: 3,
              color: "#10b981",
            },
            symbol: "circle",
            symbolSize: 8,
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(16, 185, 129, 0.2)",
                  },
                  {
                    offset: 1,
                    color: "rgba(16, 185, 129, 0.01)",
                  },
                ],
              },
            },
          },
        ],
      };
      successRateChartInstance.setOption(successRateOption);
      setSuccessRateChart(successRateChartInstance);
    }

    // Top workflows chart
    if (document.getElementById("top-workflows-chart")) {
      const topWorkflowsChartInstance = echarts.init(
        document.getElementById("top-workflows-chart")
      );
      const topWorkflowsOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
          },
          splitLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
        },
        yAxis: {
          type: "category",
          data: analyticsData.topWorkflows.map((w) => w.name),
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
          },
        },
        series: [
          {
            name: "Executions",
            type: "bar",
            data: analyticsData.topWorkflows.map((w) => w.executions),
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "#8b5cf6",
                  },
                  {
                    offset: 1,
                    color: "#6366f1",
                  },
                ],
              },
            },
          },
        ],
      };
      topWorkflowsChartInstance.setOption(topWorkflowsOption);
      setTopWorkflowsChart(topWorkflowsChartInstance);
    }

    // Cleanup
    return () => {
      executionsChart?.dispose();
      successRateChart?.dispose();
      topWorkflowsChart?.dispose();
    };
  }, []);

  // Handle window resize for charts
  useEffect(() => {
    const handleResize = () => {
      executionsChart?.resize();
      successRateChart?.resize();
      topWorkflowsChart?.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [executionsChart, successRateChart, topWorkflowsChart]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-blue-600 text-2xl font-bold mr-10">
                <i className="fa-solid fa-diagram-project mr-2"></i>
                FlowMaster
              </div>
              <nav className="hidden md:flex space-x-8">
                <a
                  href="#"
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-[17px]"
                >
                  Workflows
                </a>
                <a
                  href="#"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Templates
                </a>
                <a
                  href="#"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Analytics
                </a>
                <a
                  href="#"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Integrations
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 !rounded-button whitespace-nowrap">
                <i className="fa-solid fa-bell"></i>
              </button>
              <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 !rounded-button whitespace-nowrap">
                <i className="fa-solid fa-gear"></i>
              </button>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20young%20business%20person%20with%20confident%20expression%2C%20neutral%20background%2C%20high%20quality%20portrait%2C%20professional%20lighting&width=100&height=100&seq=10&orientation=squarish" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Dashboard Overview */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Workflow Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Manage and monitor all your automated workflows
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button whitespace-nowrap">
                    <i className="fa-solid fa-plus mr-2"></i> Create Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Workflow</DialogTitle>
                    <DialogDescription>
                      Start from scratch or use a template to create your new
                      workflow.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <Tabs defaultValue="blank">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="blank">Blank Workflow</TabsTrigger>
                        <TabsTrigger value="template">
                          From Template
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="blank" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="workflow-name"
                              className="block text-sm font-medium text-slate-700 mb-1"
                            >
                              Workflow Name
                            </label>
                            <Input
                              id="workflow-name"
                              placeholder="Enter workflow name"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="workflow-description"
                              className="block text-sm font-medium text-slate-700 mb-1"
                            >
                              Description (optional)
                            </label>
                            <Input
                              id="workflow-description"
                              placeholder="Briefly describe what this workflow does"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="template" className="mt-4">
                        <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2">
                          {workflowTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={template.image}
                                    alt={template.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-slate-800">
                                    {template.title}
                                  </h3>
                                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                                    {template.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-slate-50 !rounded-button whitespace-nowrap"
                                    >
                                      {template.category}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                      <i className="fa-solid fa-clock mr-1"></i>{" "}
                                      {template.estimatedSetupTime}
                                    </span>
                                    <span className="text-xs text-amber-500">
                                      <i className="fa-solid fa-star mr-1"></i>{" "}
                                      {template.popularity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="!rounded-button whitespace-nowrap"
                    >
                      Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 !rounded-button whitespace-nowrap">
                      Create Workflow
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Workflows
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">24</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <i className="fa-solid fa-diagram-project text-xl"></i>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-600">
                <span className="font-medium">+3</span> new this month
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    Active Workflows
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">18</h3>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <i className="fa-solid fa-circle-check text-xl"></i>
                </div>
              </div>
              <div className="mt-4 text-sm text-emerald-600">
                <span className="font-medium">75%</span> of total workflows
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Executions
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">
                    1,248
                  </h3>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <i className="fa-solid fa-bolt text-xl"></i>
                </div>
              </div>
              <div className="mt-4 text-sm text-purple-600">
                <span className="font-medium">+18%</span> from last week
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">
                    Success Rate
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">
                    94.2%
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <i className="fa-solid fa-chart-line text-xl"></i>
                </div>
              </div>
              <div className="mt-4 text-sm text-amber-600">
                <span className="font-medium">+2.1%</span> from last month
              </div>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <Card className="col-span-1 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">
                Top Workflows
              </h3>
              <div id="top-workflows-chart" className="h-[300px]"></div>
            </Card>

            <Card className="col-span-1 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">
                Daily Executions
              </h3>
              <div id="executions-chart" className="h-[300px]"></div>
            </Card>

            <Card className="col-span-1 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">
                Success Rate Trend
              </h3>
              <div id="success-rate-chart" className="h-[300px]"></div>
            </Card>
          </div>
        </div>

        {/* Template Gallery */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Featured Templates
            </h2>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 !rounded-button whitespace-nowrap"
            >
              View All Templates{" "}
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </Button>
          </div>

          <div className="relative">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              className="pb-12"
            >
              {workflowTemplates.map((template) => (
                <SwiperSlide key={template.id}>
                  <Card className="overflow-hidden h-full border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="h-[160px] overflow-hidden">
                      <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-slate-800 mb-2">
                        {template.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className="bg-slate-50 !rounded-button whitespace-nowrap"
                        >
                          {template.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-slate-50 !rounded-button whitespace-nowrap"
                        >
                          {template.complexity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fa-${i < Math.floor(template.popularity) ? "solid" : i < template.popularity ? "solid fa-star-half-stroke" : "regular"} fa-star text-sm`}
                            ></i>
                          ))}
                          <span className="ml-1 text-sm text-slate-600">
                            {template.popularity}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 !rounded-button whitespace-nowrap"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Workflow List */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Your Workflows
            </h2>
            <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-[300px]">
                <Input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 text-sm"
                />
                <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-slate-300 !rounded-button whitespace-nowrap"
                    >
                      <i className="fa-solid fa-filter mr-2"></i> Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem>
                      <i className="fa-solid fa-check-circle mr-2 text-emerald-500"></i>{" "}
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-pause-circle mr-2 text-amber-500"></i>{" "}
                      Paused
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-file mr-2 text-slate-500"></i>{" "}
                      Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-exclamation-circle mr-2 text-rose-500"></i>{" "}
                      Error
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <i className="fa-solid fa-star mr-2 text-yellow-500"></i>{" "}
                      Starred
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-clock mr-2 text-blue-500"></i>{" "}
                      Recent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-slate-300 !rounded-button whitespace-nowrap"
                    >
                      <i className="fa-solid fa-sort mr-2"></i> Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <i className="fa-solid fa-arrow-down-a-z mr-2"></i> Name
                      (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-arrow-up-z-a mr-2"></i> Name
                      (Z-A)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-calendar mr-2"></i> Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-calendar-check mr-2"></i> Oldest
                      First
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <i className="fa-solid fa-chart-line mr-2"></i> Most
                      Executions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            className="mb-6"
            onValueChange={setSelectedTab}
          >
            <TabsList>
              <TabsTrigger
                value="all"
                className="!rounded-button whitespace-nowrap"
              >
                All Workflows
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="!rounded-button whitespace-nowrap"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="!rounded-button whitespace-nowrap"
              >
                Drafts
              </TabsTrigger>
              <TabsTrigger
                value="starred"
                className="!rounded-button whitespace-nowrap"
              >
                Starred
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredWorkflows.length === 0 ? (
            <Card className="p-10 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <i className="fa-solid fa-search text-3xl"></i>
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">
                No workflows found
              </h3>
              <p className="text-slate-500 max-w-md mb-6">
                We couldn't find any workflows matching your search criteria.
                Try adjusting your filters or create a new workflow.
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 !rounded-button whitespace-nowrap"
              >
                <i className="fa-solid fa-plus mr-2"></i> Create Workflow
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorkflows.map((workflow) => (
                <WorkflowSummaryCard
                  key={workflow.id}
                  id={workflow.id}
                  title={workflow.title}
                  description={workflow.description}
                  tags={workflow.tags}
                  status={workflow.status}
                  nodeCount={workflow.nodeCount}
                  lastUpdated={workflow.lastUpdated}
                  lastRun={workflow.lastRun}
                  successRate={workflow.successRate}
                  author={workflow.author}
                  isStarred={workflow.isStarred}
                  isNew={workflow.isNew}
                  onEdit={(id) => handleAction("edit", id)}
                  onRun={(id) => handleAction("run", id)}
                  onDuplicate={(id) => handleAction("duplicate", id)}
                  onArchive={(id) => handleAction("archive", id)}
                  onStar={handleStarWorkflow}
                />
              ))}

              {/* Loading state example */}
              <WorkflowSummaryCard
                id="loading"
                title=""
                tags={[]}
                status="active"
                nodeCount={0}
                lastUpdated=""
                isLoading={true}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="text-blue-600 text-xl font-bold mb-4">
                <i className="fa-solid fa-diagram-project mr-2"></i>
                FlowMaster
              </div>
              <p className="text-slate-500 text-sm mb-4">
                The most powerful workflow automation platform for modern
                businesses.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <i className="fa-brands fa-twitter text-lg"></i>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <i className="fa-brands fa-linkedin text-lg"></i>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <i className="fa-brands fa-github text-lg"></i>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <i className="fa-brands fa-youtube text-lg"></i>
                </a>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="font-semibold text-slate-800 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="font-semibold text-slate-800 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="font-semibold text-slate-800 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-blue-600 text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © 2025 FlowMaster. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <i className="fa-brands fa-cc-visa text-slate-400 text-2xl"></i>
              <i className="fa-brands fa-cc-mastercard text-slate-400 text-2xl"></i>
              <i className="fa-brands fa-cc-amex text-slate-400 text-2xl"></i>
              <i className="fa-brands fa-paypal text-slate-400 text-2xl"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, Edit, Search, Trash2, Zap } from 'lucide-react';
import '../../App.css';

interface Workflow {
  id: number;
  title: string;
  description: string;
  lastEdited: string;
  status: 'active' | 'draft';
  nodeCount: number;
  tags: string[];
}

export default function WorkflowLibrary() {
  const [savedSearchQuery, setSavedSearchQuery] = useState('');

  const savedWorkflows: Workflow[] = [
    {
      id: 101,
      title: 'Customer Onboarding',
      description: 'My custom workflow for new customer setup',
      lastEdited: '2023-04-15T10:30:00Z',
      status: 'active',
      nodeCount: 8,
      tags: ['customer', 'onboarding'],
    },
  ];

  const filteredSavedWorkflows = savedWorkflows.filter(workflow => {
    return (
      workflow.title.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
      workflow.tags.some(tag => tag.toLowerCase().includes(savedSearchQuery.toLowerCase()))
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="p-4">
        <h2 className="font-semibold">Workflow Library</h2>
        <p className="text-xs text-muted-foreground">Browse saved workflows</p>
      </div>
      <Separator />
      <Tabs defaultValue="templates" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 px-4">
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="flex-1 flex flex-col p-0">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved workflows..."
                className="pl-8"
                value={savedSearchQuery}
                onChange={e => setSavedSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 grid gap-3">
              {filteredSavedWorkflows.length > 0 ? (
                filteredSavedWorkflows.map(workflow => (
                  <Card key={workflow.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{workflow.title}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {workflow.description}
                          </p>
                        </div>
                        <Badge
                          variant={workflow.status === 'active' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {workflow.status === 'active' ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(workflow.lastEdited)}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Zap className="h-3 w-3 mr-1" />
                          {workflow.nodeCount} nodes
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 pt-0 flex justify-between">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => console.log('Edit workflow:', workflow.id)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => console.log('Delete workflow:', workflow.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium">No saved workflows found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

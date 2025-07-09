import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Settings, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import HealthMetricsTable from "@/components/health-metrics-table";

const METRIC_ICONS = {
  "rolled_to_prod": "🚀",
  "cpp_percentage": "💻",
  "capex_percentage": "💰",
  "ram": "🔧",
  "velocity_sp": "⚡",
  "dor_work": "📋",
  "critical_bugs": "⚠️",
  "old_bugs": "🐛",
};

const METRIC_NAMES = {
  "rolled_to_prod": "Rolled to Prod",
  "cpp_percentage": "CPP %",
  "capex_percentage": "CAPEX %",
  "ram": "R&M",
  "velocity_sp": "Velocity SP",
  "dor_work": "DOR Work",
  "critical_bugs": "Critical/High Prod Bugs",
  "old_bugs": "Old Bugs",
};

export default function TeamHealth() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string>("S03");
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-600">Please wait while we load your team data</div>
        </div>
      </div>
    );
  }

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: healthMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["/api/teams", selectedTeam, "health-metrics", selectedSprint],
    enabled: !!selectedTeam,
  });

  const { data: metricConfigs } = useQuery({
    queryKey: ["/api/teams", selectedTeam, "metric-configs"],
    enabled: !!selectedTeam,
  });

  const addMetricMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/teams/${selectedTeam}/health-metrics`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "health-metrics"] });
      setIsAddingMetric(false);
      resetForm();
      toast({
        title: "Success",
        description: "Health metric added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add health metric",
        variant: "destructive",
      });
    },
  });

  const updateMetricMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/health-metrics/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "health-metrics"] });
      toast({
        title: "Success",
        description: "Metric updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update metric",
        variant: "destructive",
      });
    },
  });

  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "red":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const groupedMetrics = healthMetrics?.reduce((acc: any, metric: any) => {
    if (!acc[metric.metricName]) {
      acc[metric.metricName] = {};
    }
    acc[metric.metricName][metric.sprintNumber] = metric;
    return acc;
  }, {});

  const [newMetricData, setNewMetricData] = useState({
    metricName: "",
    sprintNumber: "S03",
    value: "",
    stringValue: "",
  });

  // Reset form when dialog opens
  const resetForm = () => {
    setNewMetricData({
      metricName: "",
      sprintNumber: selectedSprint,
      value: "",
      stringValue: "",
    });
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    addMetricMutation.mutate({
      metricName: newMetricData.metricName,
      sprintNumber: newMetricData.sprintNumber,
      value: newMetricData.value ? parseFloat(newMetricData.value) : null,
      stringValue: newMetricData.stringValue || null,
    });
  };

  if (!teams?.length) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h2>
          <p className="text-gray-600 mb-4">You need to create a team first to track health metrics.</p>
          <Button>Create Your First Team</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Health Metrics</h1>
          <p className="text-gray-600">Monitor team performance with configurable thresholds</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Team and Sprint Selection */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="team-select">Select Team</Label>
          <Select onValueChange={(value) => setSelectedTeam(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team: any) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="sprint-select">Sprint</Label>
          <Select value={selectedSprint} onValueChange={setSelectedSprint}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S01">Sprint S01</SelectItem>
              <SelectItem value="S02">Sprint S02</SelectItem>
              <SelectItem value="S03">Sprint S03</SelectItem>
              <SelectItem value="S04">Sprint S04</SelectItem>
              <SelectItem value="S05">Sprint S05</SelectItem>
              <SelectItem value="S06">Sprint S06</SelectItem>
              <SelectItem value="S07">Sprint S07</SelectItem>
              <SelectItem value="S08">Sprint S08</SelectItem>
              <SelectItem value="S09">Sprint S09</SelectItem>
              <SelectItem value="S10">Sprint S10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTeam && (
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table">Confluence-Style Table</TabsTrigger>
            <TabsTrigger value="individual">Individual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-6">
            <HealthMetricsTable 
              teamId={selectedTeam} 
              teamName={teams?.find(t => t.id === selectedTeam)?.name || "Unknown Team"}
            />
          </TabsContent>
          
          <TabsContent value="individual" className="mt-6">
            {/* Add Metric Button */}
            <div className="flex justify-end">
              <Dialog open={isAddingMetric} onOpenChange={(open) => {
                setIsAddingMetric(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Health Metric</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMetric} className="space-y-4">
                  <div>
                    <Label htmlFor="metricName">Metric Type</Label>
                    <Select value={newMetricData.metricName} onValueChange={(value) => setNewMetricData(prev => ({ ...prev, metricName: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rolled_to_prod">🚀 Rolled to Prod</SelectItem>
                        <SelectItem value="cpp_percentage">💻 CPP %</SelectItem>
                        <SelectItem value="capex_percentage">💰 CAPEX %</SelectItem>
                        <SelectItem value="ram">🔧 R&M</SelectItem>
                        <SelectItem value="velocity_sp">⚡ Velocity SP</SelectItem>
                        <SelectItem value="dor_work">📋 DOR Work</SelectItem>
                        <SelectItem value="critical_bugs">⚠️ Critical/High Prod Bugs</SelectItem>
                        <SelectItem value="old_bugs">🐛 Old Bugs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sprintNumber">Sprint Number</Label>
                    <Select value={newMetricData.sprintNumber} onValueChange={(value) => setNewMetricData(prev => ({ ...prev, sprintNumber: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S01">Sprint S01</SelectItem>
                        <SelectItem value="S02">Sprint S02</SelectItem>
                        <SelectItem value="S03">Sprint S03</SelectItem>
                        <SelectItem value="S04">Sprint S04</SelectItem>
                        <SelectItem value="S05">Sprint S05</SelectItem>
                        <SelectItem value="S06">Sprint S06</SelectItem>
                        <SelectItem value="S07">Sprint S07</SelectItem>
                        <SelectItem value="S08">Sprint S08</SelectItem>
                        <SelectItem value="S09">Sprint S09</SelectItem>
                        <SelectItem value="S10">Sprint S10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Numeric Value</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="Enter value (optional)" 
                      value={newMetricData.value}
                      onChange={(e) => setNewMetricData(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stringValue">Text Value</Label>
                    <Input 
                      placeholder="Enter text value (optional)" 
                      value={newMetricData.stringValue}
                      onChange={(e) => setNewMetricData(prev => ({ ...prev, stringValue: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addMetricMutation.isPending || !newMetricData.metricName}>
                    {addMetricMutation.isPending ? "Adding..." : "Add Metric"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Health Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Health Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <div className="text-center py-8">Loading metrics...</div>
              ) : !healthMetrics?.length ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No health metrics found for this team.</p>
                  <p className="text-sm text-gray-500">Start by adding your first metric above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Baseline</TableHead>
                        <TableHead>S00</TableHead>
                        <TableHead>S01</TableHead>
                        <TableHead>S02</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(groupedMetrics || {}).map(([metricName, sprints]: any) => {
                        const config = metricConfigs?.find((c: any) => c.metricName === metricName);
                        const sprintKeys = Object.keys(sprints).sort();
                        const latest = sprintKeys.length > 0 ? sprints[sprintKeys[sprintKeys.length - 1]] : null;
                        const previous = sprintKeys.length > 1 ? sprints[sprintKeys[sprintKeys.length - 2]] : null;

                        return (
                          <TableRow key={metricName}>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-3">
                                  {METRIC_ICONS[metricName as keyof typeof METRIC_ICONS]}
                                </span>
                                <div className="text-sm font-medium text-gray-900">
                                  {METRIC_NAMES[metricName as keyof typeof METRIC_NAMES]}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {config?.greenThreshold || "TBC"}
                            </TableCell>
                            <TableCell>
                              {sprints["S00"] && (
                                <Badge className={getColorClass(sprints["S00"].overrideColor || sprints["S00"].actualColor)}>
                                  {sprints["S00"].value || sprints["S00"].stringValue}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {sprints["S01"] && (
                                <Badge className={getColorClass(sprints["S01"].overrideColor || sprints["S01"].actualColor)}>
                                  {sprints["S01"].value || sprints["S01"].stringValue}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {sprints["S02"] && (
                                <Badge className={getColorClass(sprints["S02"].overrideColor || sprints["S02"].actualColor)}>
                                  {sprints["S02"].value || sprints["S02"].stringValue}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {latest && previous && latest.value && previous.value ? 
                                getTrendIcon(parseFloat(latest.value), parseFloat(previous.value)) :
                                <Minus className="w-4 h-4 text-gray-400" />
                              }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

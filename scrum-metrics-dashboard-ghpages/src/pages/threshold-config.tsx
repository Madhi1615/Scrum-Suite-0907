import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Target, AlertTriangle, CheckCircle } from "lucide-react";
import MetricThresholdCard from "@/components/metric-threshold-card";
import type { TeamMetricConfig, Team } from "@shared/schema";

export default function ThresholdConfig() {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: configs } = useQuery({
    queryKey: [`/api/teams/${selectedTeam}/metric-configs`],
    enabled: !!selectedTeam,
  });

  const { data: redMetrics } = useQuery({
    queryKey: ["/api/red-metrics"],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ configId, data }: { configId: number; data: any }) => {
      await apiRequest("PUT", `/api/metric-configs/${configId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeam}/metric-configs`] });
      toast({
        title: "Success",
        description: "Threshold configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update threshold configuration",
        variant: "destructive",
      });
    },
  });

  const approveMetricMutation = useMutation({
    mutationFn: async ({ metricId, comment }: { metricId: number; comment?: string }) => {
      await apiRequest("POST", `/api/health-metrics/${metricId}/approve`, { comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/red-metrics"] });
      toast({
        title: "Success",
        description: "Metric approved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve metric",
        variant: "destructive",
      });
    },
  });

  const handleConfigUpdate = (config: TeamMetricConfig, field: string, value: any) => {
    updateConfigMutation.mutate({
      configId: config.id,
      data: {
        [field]: value,
      },
    });
  };

  const handleApproveMetric = (metricId: number, comment: string = "") => {
    approveMetricMutation.mutate({ metricId, comment });
  };

  const getMetricDisplayName = (metricName: string) => {
    const names: Record<string, string> = {
      cpp_percentage: "CPP Percentage",
      velocity: "Sprint Velocity",
      bugs: "Bug Count",
      team_satisfaction: "Team Satisfaction",
      code_quality: "Code Quality",
      deployment_frequency: "Deployment Frequency", 
      capex_utilization: "CAPEX Utilization",
      innovation_time: "Innovation Time %"
    };
    return names[metricName] || metricName;
  };

  const getColorForValue = (value: number, config: TeamMetricConfig) => {
    const green = parseFloat(config.greenThreshold || "0");
    const yellow = parseFloat(config.yellowThreshold || "0");
    
    if (config.isHigherBetter) {
      if (value >= green) return "text-green-600";
      if (value >= yellow) return "text-yellow-600";
      return "text-red-600";
    } else {
      if (value <= green) return "text-green-600";
      if (value <= yellow) return "text-yellow-600";
      return "text-red-600";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Threshold Configuration & PO Approval</h1>
      </div>

      <Tabs defaultValue="thresholds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="thresholds">Threshold Management</TabsTrigger>
          <TabsTrigger value="approvals">PO Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Metric Threshold Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure automatic color-coding thresholds for team metrics. 
                Values will be automatically classified as green/yellow/red based on these settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label htmlFor="team-select" className="text-lg font-semibold text-blue-800">
                  Select Team for Threshold Configuration
                </Label>
                <Select
                  value={selectedTeam?.toString() || ""}
                  onValueChange={(value) => setSelectedTeam(parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a team to configure thresholds" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team: Team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} (ID: {team.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeam && (
                  <p className="mt-2 text-sm text-blue-700">
                    Currently configuring thresholds for: <strong>{teams?.find(t => t.id === selectedTeam)?.name}</strong>
                  </p>
                )}
              </div>

              {configs && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Configuration Summary for {teams?.find(t => t.id === selectedTeam)?.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">Team ID:</span>
                        <span className="ml-2">{selectedTeam}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">Total Metrics:</span>
                        <span className="ml-2">{configs.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">Configured:</span>
                        <span className="ml-2">{configs.filter(c => c.greenThreshold).length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">Status:</span>
                        <span className="ml-2 text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  {configs.map((config: TeamMetricConfig) => (
                    <MetricThresholdCard
                      key={config.id}
                      config={config}
                      onUpdate={handleConfigUpdate}
                      isUpdating={updateConfigMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Teams Requiring PO Approval</span>
              </CardTitle>
              <CardDescription>
                Teams with red metrics that require Product Owner approval to override to green status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redMetrics && redMetrics.length > 0 ? (
                <div className="space-y-4">
                  {redMetrics.map((teamData: any) => (
                    <Card key={teamData.team.id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="text-lg">{teamData.team.name}</CardTitle>
                        <CardDescription>
                          {teamData.redMetrics.length} metric(s) requiring approval
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {teamData.redMetrics.map((metric: any) => (
                            <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{getMetricDisplayName(metric.metricName)}</div>
                                <div className="text-sm text-gray-600">
                                  Sprint {metric.sprintNumber} • Value: {metric.value}
                                  {metric.stringValue && ` • ${metric.stringValue}`}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleApproveMetric(metric.id, "PO approved override to green")}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All metrics are healthy!</h3>
                  <p className="text-gray-600">No teams have red metrics requiring approval.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoleState } from "@/hooks/useRole";
import MetricApprovalDialog from "./metric-approval-dialog";
import { Save, Plus, Target, CheckCircle, AlertTriangle, Clock, Filter } from "lucide-react";
import type { TeamMetricConfig, TeamHealthMetric } from "@shared/schema";

interface HealthMetricsTableProps {
  teamId: number;
  teamName: string;
}

export default function HealthMetricsTable({ teamId, teamName }: HealthMetricsTableProps) {
  const { toast } = useToast();
  const { currentRole, permissions } = useRoleState();
  const [currentSprint, setCurrentSprint] = useState("S01");
  const [metricValues, setMetricValues] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("all");
  const [approvalDialog, setApprovalDialog] = useState<{
    isOpen: boolean;
    metric: any;
  }>({ isOpen: false, metric: null });

  const { data: configs } = useQuery({
    queryKey: [`/api/teams/${teamId}/metric-configs`],
  });

  const { data: existingMetrics } = useQuery({
    queryKey: [`/api/teams/${teamId}/health-metrics`],
  });

  const saveMetricMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/teams/${teamId}/health-metrics`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/health-metrics`] });
      setMetricValues({});
      toast({
        title: "Success",
        description: "Health metrics saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save health metrics",
        variant: "destructive",
      });
    },
  });

  const getMetricDisplayName = (metricName: string) => {
    const names: Record<string, string> = {
      cpp_percentage: "Cost Per Point Percentage",
      capex_percentage: "Capital Expenditure Percentage",
      velocity_sp: "Velocity (Story Points)",
      dor_work_percentage: "Definition of Ready Work Percentage",
      critical_high_bugs: "Critical/High Priority Bugs",
      old_bugs: "Old Bugs (>30 days)",
    };
    return names[metricName] || metricName;
  };

  const getColorClass = (value: string, metricName: string) => {
    if (!value || !configs) return "bg-gray-100";
    
    const config = configs.find((c: TeamMetricConfig) => c.metricName === metricName);
    if (!config) return "bg-gray-100";

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "bg-gray-100";
    
    const green = parseFloat(config.greenThreshold || "0");
    const yellow = parseFloat(config.yellowThreshold || "0");

    console.log(`Color calculation for ${metricName}: value=${numValue}, green=${green}, yellow=${yellow}, isHigherBetter=${config.isHigherBetter}`);

    if (config.isHigherBetter) {
      // For higher is better metrics (CPP, CAPEX, velocity, DOR)
      if (numValue >= green) return "bg-green-200 text-green-800 border-green-300";
      if (numValue >= yellow) return "bg-yellow-200 text-yellow-800 border-yellow-300";
      return "bg-red-200 text-red-800 border-red-300";
    } else {
      // For lower is better metrics (bugs) - any increase from baseline should be red
      if (numValue <= green) return "bg-green-200 text-green-800 border-green-300";
      if (numValue <= yellow) return "bg-yellow-200 text-yellow-800 border-yellow-300";
      return "bg-red-200 text-red-800 border-red-300";
    }
  };

  const getInputColorClass = (value: string, metricName: string) => {
    if (!value || !configs) return "bg-white";
    
    const config = configs.find((c: TeamMetricConfig) => c.metricName === metricName);
    if (!config) return "bg-white";

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "bg-white";
    
    const green = parseFloat(config.greenThreshold || "0");
    const yellow = parseFloat(config.yellowThreshold || "0");

    if (config.isHigherBetter) {
      if (numValue >= green) return "bg-green-100 text-green-800 border-green-300";
      if (numValue >= yellow) return "bg-yellow-100 text-yellow-800 border-yellow-300";
      return "bg-red-100 text-red-800 border-red-300";
    } else {
      if (numValue <= green) return "bg-green-100 text-green-800 border-green-300";
      if (numValue <= yellow) return "bg-yellow-100 text-yellow-800 border-yellow-300";
      return "bg-red-100 text-red-800 border-red-300";
    }
  };

  const handleValueChange = (metricName: string, value: string) => {
    console.log(`Sprint value change for ${metricName}: ${value}`);
    setMetricValues(prev => ({
      ...prev,
      [metricName]: value
    }));
  };

  const handleBaselineChange = (metricName: string, value: string) => {
    console.log(`Baseline change for ${metricName}: ${value}`);
    setBaseline(prev => ({
      ...prev,
      [metricName]: value
    }));
  };

  const handleSaveMetrics = async () => {
    for (const [metricName, value] of Object.entries(metricValues)) {
      if (value && value.trim()) {
        await saveMetricMutation.mutateAsync({
          sprintNumber: currentSprint,
          metricName,
          value: value.trim(),
          stringValue: null,
        });
      }
    }
    setMetricValues({});
  };

  const sprints = ["Baseline", "S01", "S02", "S03", "S04", "S05", "S06", "S07"];

  // Get existing metric values for display
  const getExistingValue = (metricName: string, sprint: string) => {
    if (sprint === "Baseline") {
      return baseline[metricName] || "";
    }
    
    // For current sprint, show saved value from database
    const metric = existingMetrics?.find((m: TeamHealthMetric) => 
      m.metricName === metricName && m.sprintNumber === sprint
    );
    return metric?.value?.toString() || "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Health Metrics for {teamName}</span>
            <Badge variant="outline" className={
              currentRole === "admin" ? "border-red-300 text-red-700" :
              currentRole === "product_owner" ? "border-blue-300 text-blue-700" :
              "border-green-300 text-green-700"
            }>
              {permissions.label}
            </Badge>
          </span>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="green">Green Only</SelectItem>
                <SelectItem value="red">Red Only</SelectItem>
                <SelectItem value="approved">Approved Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Current Sprint:</label>
            <select
              value={currentSprint}
              onChange={(e) => setCurrentSprint(e.target.value)}
              className="px-3 py-1 border rounded-md"
            >
              {sprints.filter(s => s !== "Baseline").map(sprint => (
                <option key={sprint} value={sprint}>{sprint}</option>
              ))}
            </select>
          </div>
          {permissions.canEnterData && (
            <Button
              onClick={handleSaveMetrics}
              disabled={saveMetricMutation.isPending || Object.keys(metricValues).length === 0}
              className="ml-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMetricMutation.isPending ? "Saving..." : "Save Metrics"}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-3 text-left font-medium">Metric</th>
                {sprints.map(sprint => (
                  <th key={sprint} className="border border-gray-300 p-3 text-center font-medium min-w-[80px]">
                    {sprint}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {configs?.map((config: TeamMetricConfig) => (
                <tr key={`${teamId}-${config.metricName}-${config.id}`} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                    {getMetricDisplayName(config.metricName)}
                    <div className="text-xs text-gray-500 mt-1">
                      {config.isHigherBetter ? "↑ Higher better" : "↓ Lower better"}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Green: {config.greenThreshold}+ | Yellow: {config.yellowThreshold}+ | Red: &lt;{config.yellowThreshold}
                    </div>
                  </td>
                  
                  {/* Baseline column */}
                  <td key={`${config.metricName}-baseline`} className="border border-gray-300 p-1">
                    <Input
                      type="number"
                      value={baseline[config.metricName] || getExistingValue(config.metricName, "Baseline")}
                      onChange={(e) => handleBaselineChange(config.metricName, e.target.value)}
                      className="w-full text-center border-0 bg-gray-100"
                      placeholder="Base"
                      disabled={!permissions.canEnterData}
                    />
                  </td>
                  
                  {/* Sprint columns */}
                  {sprints.filter(s => s !== "Baseline").map((sprint, index) => {
                    const existingValue = getExistingValue(config.metricName, sprint);
                    const colorClass = getColorClass(existingValue, config.metricName);
                    const isCurrentSprint = sprint === currentSprint;
                    
                    return (
                      <td key={`${config.metricName}-${sprint}-${index}`} className={`border border-gray-300 p-1 ${colorClass}`}>
                        {isCurrentSprint ? (
                          <div className="flex items-center space-x-1">
                            <Input
                              type="number"
                              value={metricValues[config.metricName] || ""}
                              onChange={(e) => handleValueChange(config.metricName, e.target.value)}
                              className={`w-full text-center border-2 font-medium ${getInputColorClass(metricValues[config.metricName] || "", config.metricName)}`}
                              placeholder="Enter"
                              disabled={!permissions.canEnterData}
                            />
                            {permissions.canApprove && getInputColorClass(metricValues[config.metricName] || "", config.metricName).includes("red") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setApprovalDialog({
                                  isOpen: true,
                                  metric: {
                                    id: 0, // This would be real ID in production
                                    teamId,
                                    metricName: config.metricName,
                                    value: metricValues[config.metricName] || "",
                                    sprintNumber: sprint,
                                    actualColor: "red"
                                  }
                                })}
                                className="p-1 h-8 w-8"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-2 font-medium">
                            {existingValue || "-"}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300"></div>
              <span>Green = Good (within target)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300"></div>
              <span>Yellow = Warning (near threshold)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300"></div>
              <span>Red = Critical (needs attention)</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
            <strong>How it works:</strong> Enter values in the current sprint column and watch them automatically turn green/yellow/red based on your configured thresholds. 
            For example, if CPP % threshold is 50+ = green, entering "60" will show green background, while "30" will show red.
          </div>
        </div>
        
        <MetricApprovalDialog
          isOpen={approvalDialog.isOpen}
          onClose={() => setApprovalDialog({ isOpen: false, metric: null })}
          metric={approvalDialog.metric}
        />
      </CardContent>
    </Card>
  );
}
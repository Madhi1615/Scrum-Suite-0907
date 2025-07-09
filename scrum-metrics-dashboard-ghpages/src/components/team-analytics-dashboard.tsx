import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import type { TeamHealthMetric, Team } from "@shared/schema";

interface TeamAnalyticsDashboardProps {
  userRole: "scrum_master" | "product_owner" | "admin";
}

export default function TeamAnalyticsDashboard({ userRole }: TeamAnalyticsDashboardProps) {
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: allMetrics } = useQuery({
    queryKey: ["/api/health-metrics/all"],
  });

  const { data: redMetrics } = useQuery({
    queryKey: ["/api/red-metrics"],
  });

  // Analytics calculations
  const getMetricsByColor = (color: string) => {
    return allMetrics?.filter((metric: TeamHealthMetric) => metric.finalColor === color) || [];
  };

  const getTeamMetrics = (teamId: number) => {
    return allMetrics?.filter((metric: TeamHealthMetric) => metric.teamId === teamId) || [];
  };

  const getApprovedMetrics = () => {
    return allMetrics?.filter((metric: TeamHealthMetric) => metric.poApproved) || [];
  };

  const exportData = () => {
    const csvData = allMetrics?.map((metric: TeamHealthMetric) => ({
      Team: teams?.find((t: Team) => t.id === metric.teamId)?.name || "Unknown",
      Sprint: metric.sprintNumber,
      Metric: metric.metricName,
      Value: metric.value,
      Color: metric.finalColor,
      Approved: metric.poApproved ? "Yes" : "No",
      ApprovedBy: metric.poApprovedBy || "N/A",
      Comment: metric.poApprovalComment || "N/A"
    })) || [];

    const csv = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scrum-metrics-report.csv";
    a.click();
  };

  const greenMetrics = getMetricsByColor("green");
  const yellowMetrics = getMetricsByColor("yellow");
  const redMetricsData = getMetricsByColor("red");
  const approvedMetrics = getApprovedMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scrum Metrics Analytics</h1>
          <p className="text-gray-600">Sprint Quality Health Tracker across all teams</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Green Metrics</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{greenMetrics.length}</div>
            <p className="text-xs text-muted-foreground">Within threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yellow Metrics</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{yellowMetrics.length}</div>
            <p className="text-xs text-muted-foreground">Warning threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Red Metrics</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{redMetricsData.length}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PO Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvedMetrics.length}</div>
            <p className="text-xs text-muted-foreground">Manual overrides</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList>
          <TabsTrigger value="teams">Team Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metric Analysis</TabsTrigger>
          {(userRole === "product_owner" || userRole === "admin") && (
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          )}
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4">
            {teams?.map((team: Team) => {
              const teamMetrics = getTeamMetrics(team.id);
              const teamGreen = teamMetrics.filter(m => m.finalColor === "green").length;
              const teamYellow = teamMetrics.filter(m => m.finalColor === "yellow").length;
              const teamRed = teamMetrics.filter(m => m.finalColor === "red").length;
              
              return (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{team.name}</span>
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {teamGreen} Green
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {teamYellow} Yellow
                        </Badge>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {teamRed} Red
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      Total Metrics: {teamMetrics.length} | 
                      Health Score: {teamMetrics.length > 0 ? Math.round((teamGreen / teamMetrics.length) * 100) : 0}%
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metric Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["cpp_percentage", "capex_percentage", "velocity_sp", "dor_work_percentage", "critical_high_bugs", "old_bugs"].map(metricName => {
                  const metricData = allMetrics?.filter((m: TeamHealthMetric) => m.metricName === metricName) || [];
                  const metricGreen = metricData.filter(m => m.finalColor === "green").length;
                  const metricYellow = metricData.filter(m => m.finalColor === "yellow").length;
                  const metricRed = metricData.filter(m => m.finalColor === "red").length;
                  
                  const getDisplayName = (name: string) => {
                    const names: Record<string, string> = {
                      cpp_percentage: "Cost Per Point Percentage",
                      capex_percentage: "Capital Expenditure Percentage", 
                      velocity_sp: "Velocity Story Points",
                      dor_work_percentage: "Definition of Ready Work Percentage",
                      critical_high_bugs: "Critical/High Priority Bugs",
                      old_bugs: "Old Bugs >30 days"
                    };
                    return names[name] || name.replace(/_/g, " ");
                  };
                  
                  return (
                    <div key={metricName} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{getDisplayName(metricName)}</span>
                      <div className="flex space-x-2">
                        <Badge className="bg-green-100 text-green-800">{metricGreen}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">{metricYellow}</Badge>
                        <Badge className="bg-red-100 text-red-800">{metricRed}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(userRole === "product_owner" || userRole === "admin") && (
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Metrics Requiring PO Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {redMetrics && redMetrics.length > 0 ? (
                  <div className="space-y-3">
                    {redMetrics.map((teamData: any, index: number) => (
                      <div key={`team-${teamData.teamId}-${index}`} className="border rounded p-4">
                        <h3 className="font-semibold mb-2">{teamData.teamName}</h3>
                        <div className="space-y-2">
                          {teamData.redMetrics.map((metric: TeamHealthMetric, metricIndex: number) => (
                            <div key={`metric-${metric.id}-${metricIndex}`} className="flex items-center justify-between bg-red-50 p-2 rounded">
                              <div>
                                <span className="font-medium">{metric.metricName}</span>
                                <span className="text-sm text-gray-600 ml-2">
                                  Value: {metric.value} | Sprint: {metric.sprintNumber}
                                </span>
                              </div>
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No metrics requiring approval
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedMetrics.map((metric: TeamHealthMetric) => (
                  <div key={metric.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">
                          {teams?.find((t: Team) => t.id === metric.teamId)?.name} - {metric.metricName}
                        </span>
                        <div className="text-sm text-gray-600">
                          Sprint: {metric.sprintNumber} | Value: {metric.value}
                        </div>
                        <div className="text-sm text-gray-500">
                          Approved by: {metric.poApprovedBy}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
                    </div>
                    {metric.poApprovalComment && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Comment: {metric.poApprovalComment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
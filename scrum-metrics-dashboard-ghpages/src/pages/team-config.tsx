import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Settings, Trash2, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const METRIC_TYPES = [
  { value: "rolled_to_prod", label: "Rolled to Prod", higherBetter: true },
  { value: "cpp_percentage", label: "CPP %", higherBetter: true },
  { value: "capex_percentage", label: "CAPEX %", higherBetter: true },
  { value: "ram", label: "R&M", higherBetter: true },
  { value: "velocity_sp", label: "Velocity SP", higherBetter: true },
  { value: "dor_work", label: "DOR Work", higherBetter: false },
  { value: "critical_bugs", label: "Critical/High Prod Bugs", higherBetter: false },
  { value: "old_bugs", label: "Old Bugs", higherBetter: false },
];

export default function TeamConfig() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isCreatingConfig, setIsCreatingConfig] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: teamDetails } = useQuery({
    queryKey: ["/api/teams", selectedTeam],
    enabled: !!selectedTeam,
  });

  const { data: metricConfigs } = useQuery({
    queryKey: ["/api/teams", selectedTeam, "metric-configs"],
    enabled: !!selectedTeam,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/teams", selectedTeam, "members"],
    enabled: !!selectedTeam,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/teams", data);
      return response.json();
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setSelectedTeam(team.id);
      setIsCreatingTeam(false);
      toast({
        title: "Success",
        description: "Team created successfully",
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
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/teams/${selectedTeam}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Team updated successfully",
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
        description: "Failed to update team",
        variant: "destructive",
      });
    },
  });

  const createMetricConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/teams/${selectedTeam}/metric-configs`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "metric-configs"] });
      setIsCreatingConfig(false);
      toast({
        title: "Success",
        description: "Metric configuration created successfully",
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
        description: "Failed to create metric configuration",
        variant: "destructive",
      });
    },
  });

  const updateMetricConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/metric-configs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "metric-configs"] });
      toast({
        title: "Success",
        description: "Metric configuration updated successfully",
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
        description: "Failed to update metric configuration",
        variant: "destructive",
      });
    },
  });

  const handleCreateTeam = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const size = parseInt(formData.get("size") as string);
    const sprintDurationWeeks = parseInt(formData.get("sprintDurationWeeks") as string);

    createTeamMutation.mutate({
      name,
      size,
      sprintDurationWeeks,
    });
  };

  const handleUpdateTeam = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const size = parseInt(formData.get("size") as string);
    const sprintDurationWeeks = parseInt(formData.get("sprintDurationWeeks") as string);

    updateTeamMutation.mutate({
      name,
      size,
      sprintDurationWeeks,
    });
  };

  const handleCreateMetricConfig = async (formData: FormData) => {
    const metricName = formData.get("metricName") as string;
    const greenThreshold = formData.get("greenThreshold") as string;
    const yellowThreshold = formData.get("yellowThreshold") as string;
    const redThreshold = formData.get("redThreshold") as string;
    
    const metricType = METRIC_TYPES.find(m => m.value === metricName);

    createMetricConfigMutation.mutate({
      metricName,
      greenThreshold: parseFloat(greenThreshold),
      yellowThreshold: parseFloat(yellowThreshold),
      redThreshold: parseFloat(redThreshold),
      isHigherBetter: metricType?.higherBetter || true,
    });
  };

  const handleUpdateMetricConfig = async (configId: number, formData: FormData) => {
    const greenThreshold = formData.get("greenThreshold") as string;
    const yellowThreshold = formData.get("yellowThreshold") as string;
    const redThreshold = formData.get("redThreshold") as string;

    updateMetricConfigMutation.mutate({
      id: configId,
      data: {
        greenThreshold: parseFloat(greenThreshold),
        yellowThreshold: parseFloat(yellowThreshold),
        redThreshold: parseFloat(redThreshold),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Configuration</h1>
          <p className="text-gray-600">Configure thresholds and settings for each team</p>
        </div>
        <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateTeam(formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input name="name" placeholder="Team Alpha" required />
              </div>
              <div>
                <Label htmlFor="size">Team Size</Label>
                <Input name="size" type="number" placeholder="8" defaultValue="8" required />
              </div>
              <div>
                <Label htmlFor="sprintDurationWeeks">Sprint Duration (weeks)</Label>
                <Select name="sprintDurationWeeks" defaultValue="2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 weeks</SelectItem>
                    <SelectItem value="3">3 weeks</SelectItem>
                    <SelectItem value="4">4 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Select Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams?.map((team: any) => (
              <Card 
                key={team.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTeam === team.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">
                        {team.size} members • {team.sprintDurationWeeks}w sprints
                      </p>
                    </div>
                    {selectedTeam === team.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!teams || teams.length === 0) && (
              <div className="col-span-full text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teams Found</h3>
                <p className="text-gray-600 mb-4">Create your first team to get started with the scrum suite.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTeam && teamDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Team Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateTeam(formData);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="name">Team Name</Label>
                  <Input name="name" defaultValue={teamDetails.name} required />
                </div>
                <div>
                  <Label htmlFor="size">Team Size</Label>
                  <Input name="size" type="number" defaultValue={teamDetails.size} required />
                </div>
                <div>
                  <Label htmlFor="sprintDurationWeeks">Sprint Duration (weeks)</Label>
                  <Select name="sprintDurationWeeks" defaultValue={teamDetails.sprintDurationWeeks?.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 weeks</SelectItem>
                      <SelectItem value="3">3 weeks</SelectItem>
                      <SelectItem value="4">4 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={updateTeamMutation.isPending}>
                  {updateTeamMutation.isPending ? "Updating..." : "Update Team"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Metric Configurations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Metric Thresholds
                </CardTitle>
                <Dialog open={isCreatingConfig} onOpenChange={setIsCreatingConfig}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Metric
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Metric Thresholds</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleCreateMetricConfig(formData);
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="metricName">Metric Type</Label>
                        <Select name="metricName" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            {METRIC_TYPES.map((metric) => (
                              <SelectItem key={metric.value} value={metric.value}>
                                {metric.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="greenThreshold">Green (Good)</Label>
                          <Input name="greenThreshold" type="number" step="0.01" placeholder="50" required />
                        </div>
                        <div>
                          <Label htmlFor="yellowThreshold">Yellow (Warning)</Label>
                          <Input name="yellowThreshold" type="number" step="0.01" placeholder="30" required />
                        </div>
                        <div>
                          <Label htmlFor="redThreshold">Red (Critical)</Label>
                          <Input name="redThreshold" type="number" step="0.01" placeholder="15" required />
                        </div>
                      </div>
                      <Button type="submit" disabled={createMetricConfigMutation.isPending}>
                        {createMetricConfigMutation.isPending ? "Creating..." : "Create Configuration"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricConfigs?.length ? (
                  metricConfigs.map((config: any) => {
                    const metricType = METRIC_TYPES.find(m => m.value === config.metricName);
                    return (
                      <div key={config.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {metricType?.label || config.metricName}
                          </h4>
                          <Badge variant={config.isHigherBetter ? "default" : "secondary"}>
                            {config.isHigherBetter ? "Higher Better" : "Lower Better"}
                          </Badge>
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleUpdateMetricConfig(config.id, formData);
                        }}>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div>
                              <Label className="text-xs text-gray-500">Green</Label>
                              <Input 
                                name="greenThreshold"
                                type="number" 
                                step="0.01" 
                                defaultValue={config.greenThreshold}
                                className="text-sm h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Yellow</Label>
                              <Input 
                                name="yellowThreshold"
                                type="number" 
                                step="0.01" 
                                defaultValue={config.yellowThreshold}
                                className="text-sm h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Red</Label>
                              <Input 
                                name="redThreshold"
                                type="number" 
                                step="0.01" 
                                defaultValue={config.redThreshold}
                                className="text-sm h-8"
                              />
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="w-full"
                            disabled={updateMetricConfigMutation.isPending}
                          >
                            Update Thresholds
                          </Button>
                        </form>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No metric configurations found.</p>
                    <p className="text-gray-500 text-xs">Add metrics to configure thresholds.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

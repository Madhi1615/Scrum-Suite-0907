import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Velocity() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: velocityData } = useQuery({
    queryKey: ["/api/teams", selectedTeam, "velocity"],
    enabled: !!selectedTeam,
  });

  const addVelocityMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/teams/${selectedTeam}/velocity`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "velocity"] });
      toast({
        title: "Success",
        description: "Sprint velocity added successfully",
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
        description: "Failed to add sprint velocity",
        variant: "destructive",
      });
    },
  });

  const handleAddVelocity = async (formData: FormData) => {
    const sprintNumber = formData.get("sprintNumber") as string;
    const plannedStoryPoints = parseInt(formData.get("plannedStoryPoints") as string);
    const completedStoryPoints = parseInt(formData.get("completedStoryPoints") as string);
    const sprintDurationDays = parseInt(formData.get("sprintDurationDays") as string);
    const absentDays = parseInt(formData.get("absentDays") as string) || 0;
    const holidayDays = parseInt(formData.get("holidayDays") as string) || 0;

    addVelocityMutation.mutate({
      sprintNumber,
      plannedStoryPoints,
      completedStoryPoints,
      sprintDurationDays,
      absentDays,
      holidayDays,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    });
  };

  const calculateAverage = (data: any[], field: string, count: number = 3) => {
    if (!data?.length) return 0;
    const recent = data.slice(0, count);
    const sum = recent.reduce((acc, item) => acc + (item[field] || 0), 0);
    return Math.round(sum / recent.length);
  };

  const calculateTrend = (data: any[]) => {
    if (!data?.length || data.length < 2) return 0;
    const latest = data[0]?.completedStoryPoints || 0;
    const previous = data[1]?.completedStoryPoints || 0;
    if (previous === 0) return 0;
    return Math.round(((latest - previous) / previous) * 100);
  };

  const currentVelocity = velocityData?.[0]?.completedStoryPoints || 0;
  const averageVelocity = calculateAverage(velocityData, 'completedStoryPoints');
  const velocityTrend = calculateTrend(velocityData);
  const predictedNext = averageVelocity > 0 ? Math.round(averageVelocity * 1.1) : 0;

  if (!teams?.length) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h2>
          <p className="text-gray-600 mb-4">You need to create a team first to track velocity.</p>
          <Button>Create Your First Team</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sprint Velocity Calculator</h1>
        <p className="text-gray-600">Track and calculate team velocity across sprints</p>
      </div>

      {/* Team Selection */}
      <div className="max-w-sm">
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

      {selectedTeam && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Velocity Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Sprint Data</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddVelocity(formData);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="sprintNumber">Sprint Number</Label>
                  <Input name="sprintNumber" placeholder="S03" required />
                </div>
                <div>
                  <Label htmlFor="plannedStoryPoints">Story Points Planned</Label>
                  <Input name="plannedStoryPoints" type="number" placeholder="45" required />
                </div>
                <div>
                  <Label htmlFor="completedStoryPoints">Story Points Completed</Label>
                  <Input name="completedStoryPoints" type="number" placeholder="42" required />
                </div>
                <div>
                  <Label htmlFor="sprintDurationDays">Sprint Duration (days)</Label>
                  <Input name="sprintDurationDays" type="number" placeholder="14" defaultValue="14" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="absentDays">Team Member Absent Days</Label>
                    <Input name="absentDays" type="number" placeholder="5" defaultValue="0" />
                    <p className="text-xs text-gray-500 mt-1">Total days team members were absent</p>
                  </div>
                  <div>
                    <Label htmlFor="holidayDays">Holiday Days in Sprint</Label>
                    <Input name="holidayDays" type="number" placeholder="2" defaultValue="0" />
                    <p className="text-xs text-gray-500 mt-1">National/company holidays during sprint</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={addVelocityMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  {addVelocityMutation.isPending ? "Adding..." : "Add Sprint Data"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Velocity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Velocity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Current Sprint Velocity</span>
                  <span className="text-lg font-bold text-blue-600">{currentVelocity} SP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Average Velocity (Last 3)</span>
                  <span className="text-lg font-bold text-green-600">{averageVelocity} SP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Velocity Trend</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {velocityTrend > 0 ? "+" : ""}{velocityTrend}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Predicted Next Sprint</span>
                  <span className="text-lg font-bold text-purple-600">{predictedNext} SP</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">Avg Absent Days</span>
                    <span className="text-sm font-bold text-orange-600">
                      {velocityData?.length ? 
                        Math.round(velocityData.reduce((sum: number, s: any) => sum + (s.absentDays || 0), 0) / velocityData.length * 10) / 10 
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">Avg Holidays</span>
                    <span className="text-sm font-bold text-red-600">
                      {velocityData?.length ? 
                        Math.round(velocityData.reduce((sum: number, s: any) => sum + (s.holidayDays || 0), 0) / velocityData.length * 10) / 10 
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTeam && (
        <>
          {/* Velocity History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Velocity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!velocityData?.length ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No velocity data found for this team.</p>
                  <p className="text-sm text-gray-500">Start by adding sprint data above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Sprint</th>
                        <th className="text-left py-2">Planned SP</th>
                        <th className="text-left py-2">Completed SP</th>
                        <th className="text-left py-2">Completion %</th>
                        <th className="text-left py-2">Duration</th>
                        <th className="text-left py-2">Absent Days</th>
                        <th className="text-left py-2">Holidays</th>
                      </tr>
                    </thead>
                    <tbody>
                      {velocityData.map((sprint: any, index: number) => {
                        const completionRate = sprint.plannedStoryPoints > 0 
                          ? Math.round((sprint.completedStoryPoints / sprint.plannedStoryPoints) * 100)
                          : 0;
                        return (
                          <tr key={sprint.id} className="border-b">
                            <td className="py-2 font-medium">{sprint.sprintNumber}</td>
                            <td className="py-2">{sprint.plannedStoryPoints}</td>
                            <td className="py-2">{sprint.completedStoryPoints}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                completionRate >= 100 ? 'bg-green-100 text-green-800' :
                                completionRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {completionRate}%
                              </span>
                            </td>
                            <td className="py-2">{sprint.sprintDurationDays} days</td>
                            <td className="py-2">{sprint.absentDays || 0}</td>
                            <td className="py-2">{sprint.holidayDays || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Velocity Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Velocity Trend Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would be implemented here</p>
                  <p className="text-sm text-gray-400">Showing velocity trends across last 10 sprints</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

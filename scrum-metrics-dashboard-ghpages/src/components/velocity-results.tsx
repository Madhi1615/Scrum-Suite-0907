import { TrendingUp, Info, Save, Printer, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SprintVelocityForm, VelocityCalculationResult, InsertSprintCalculation } from "@shared/schema";

interface VelocityResultsProps {
  formData: Partial<SprintVelocityForm>;
  calculationResult: VelocityCalculationResult | null;
}

export default function VelocityResults({ formData, calculationResult }: VelocityResultsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveCalculationMutation = useMutation({
    mutationFn: async (calculation: InsertSprintCalculation) => {
      const response = await apiRequest("POST", "/api/sprint-calculations", calculation);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sprint calculation saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sprint-calculations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save calculation",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!calculationResult || !formData.teamName || !formData.historicalVelocities || !formData.teamMembers) {
      return;
    }

    const calculation: InsertSprintCalculation = {
      teamName: formData.teamName,
      historicalVelocities: formData.historicalVelocities,
      teamMembers: formData.teamMembers,
      sprintStartDate: formData.sprintStartDate || "",
      sprintEndDate: formData.sprintEndDate || "",
      holidays: formData.holidays || [],
      projectedVelocity: calculationResult.projectedVelocity,
      teamCapacity: calculationResult.teamCapacity,
    };

    saveCalculationMutation.mutate(calculation);
  };

  const handlePrint = () => {
    window.print();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-emerald-400 to-emerald-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-amber-400 to-amber-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600',
    ];
    return colors[index % colors.length];
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      frontend: "Frontend",
      backend: "Backend",
      fullstack: "Full Stack",
      qa: "QA Engineer",
      devops: "DevOps",
    };
    return labels[role] || role;
  };

  if (!calculationResult) {
    return (
      <div className="form-card animate-fade-in sticky top-8" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-container bg-gradient-to-br from-gray-400 to-gray-600">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Sprint Velocity Projection</h2>
            <p className="text-muted-foreground">Complete the form to see results</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-blue-400" />
          </div>
          <p className="text-muted-foreground text-lg">Fill out the form and click "Calculate Sprint Velocity" to see your projected capacity.</p>
        </div>
      </div>
    );
  }

  const velocityChange = ((calculationResult.projectedVelocity - calculationResult.averageHistoricalVelocity) / calculationResult.averageHistoricalVelocity) * 100;

  return (
    <div className="form-card animate-fade-in sticky top-8" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center space-x-4 mb-8">
        <div className="icon-container bg-gradient-to-br from-green-500 to-emerald-600">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold gradient-text">Sprint Velocity Projection</h2>
          <p className="text-muted-foreground">Based on team capacity and historical data</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-6 mb-8">
        <div className="metric-card bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Projected Velocity</p>
              <p className="text-4xl font-bold text-white mt-2">
                {calculationResult.projectedVelocity.toFixed(1)}
              </p>
              <p className="text-blue-200 text-sm">story points</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">vs. Historical Avg</p>
              <p className={`text-2xl font-bold ${velocityChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {velocityChange >= 0 ? '+' : ''}{velocityChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="metric-card bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Team Capacity</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {calculationResult.teamCapacity.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="metric-card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Working Days</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {calculationResult.workingDays} / {calculationResult.totalSprintDays}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Capacity Breakdown</h3>
        
        {calculationResult.teamMembersWithCapacity.map((member, index) => (
          <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 bg-gradient-to-r ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                <span className="text-white text-xs font-medium">
                  {getInitials(member.name || `M${index + 1}`)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {member.name || `Member ${index + 1}`}
                </p>
                <p className="text-xs text-gray-500">{getRoleLabel(member.role)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                member.effectiveCapacity >= 90 ? 'text-gray-900' : 
                member.effectiveCapacity >= 70 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {member.effectiveCapacity.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">
                {Math.round((calculationResult.workingDays - member.absentDates.filter(d => d).length) * member.capacityFactor)} / {calculationResult.workingDays} days
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
        <Button 
          onClick={handleSave}
          disabled={saveCalculationMutation.isPending}
          className="btn-primary w-full py-3"
        >
          <Save className="w-5 h-5 mr-2" />
          {saveCalculationMutation.isPending ? "Saving..." : "Save Results"}
        </Button>
        <Button 
          onClick={handlePrint}
          className="btn-secondary w-full py-3"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Recommendations */}
      {calculationResult.recommendations.length > 0 && (
        <div className="mt-8 metric-card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-900 mb-3">Recommendations</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                {calculationResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
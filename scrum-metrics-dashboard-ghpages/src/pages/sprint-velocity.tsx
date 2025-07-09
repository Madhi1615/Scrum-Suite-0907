import { useState } from "react";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoricalVelocityForm from "@/components/historical-velocity-form";
import TeamManagementForm from "@/components/team-management-form";
import SprintPlanningForm from "@/components/sprint-planning-form";
import VelocityResults from "@/components/velocity-results";
import { calculateSprintVelocity } from "@/lib/velocity-calculator";
import type { SprintVelocityForm, VelocityCalculationResult } from "@shared/schema";

export default function SprintVelocity() {
  const [formData, setFormData] = useState<Partial<SprintVelocityForm>>({
    teamName: "",
    historicalVelocities: [0, 0, 0, 0, 0],
    teamSize: 5,
    teamMembers: [],
    sprintStartDate: "",
    sprintEndDate: "",
    holidays: [],
  });

  const [calculationResult, setCalculationResult] = useState<VelocityCalculationResult | null>(null);

  const updateFormData = (updates: Partial<SprintVelocityForm>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCalculate = () => {
    if (isFormValid()) {
      const result = calculateSprintVelocity(formData as SprintVelocityForm);
      setCalculationResult(result);
    }
  };

  const isFormValid = () => {
    return (
      formData.teamName &&
      formData.historicalVelocities?.every(v => v > 0) &&
      formData.teamMembers?.length === formData.teamSize &&
      formData.teamMembers?.every(m => m.name.trim() !== "") &&
      formData.sprintStartDate &&
      formData.sprintEndDate
    );
  };

  const handleExport = () => {
    if (!calculationResult) return;
    
    const exportData = {
      teamName: formData.teamName,
      calculationDate: new Date().toISOString(),
      historicalVelocities: formData.historicalVelocities,
      projectedVelocity: calculationResult.projectedVelocity,
      teamCapacity: calculationResult.teamCapacity,
      workingDays: calculationResult.workingDays,
      recommendations: calculationResult.recommendations,
      teamMembers: calculationResult.teamMembersWithCapacity,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint-velocity-${formData.teamName?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header with Gradient */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4 animate-fade-in">
              <div className="icon-container">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Sprint Velocity Builder</h1>
                <p className="text-blue-100">AI-powered agile team capacity planning</p>
              </div>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={!calculationResult}
              className="btn-secondary animate-float"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 translate-y-24"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Forms */}
          <div className="lg:col-span-2 space-y-8 animate-slide-up">
            <HistoricalVelocityForm
              data={formData}
              onUpdate={updateFormData}
            />
            
            <TeamManagementForm
              data={formData}
              onUpdate={updateFormData}
            />
            
            <SprintPlanningForm
              data={formData}
              onUpdate={updateFormData}
              onCalculate={handleCalculate}
              isCalculateDisabled={!isFormValid()}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <VelocityResults
              formData={formData}
              calculationResult={calculationResult}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
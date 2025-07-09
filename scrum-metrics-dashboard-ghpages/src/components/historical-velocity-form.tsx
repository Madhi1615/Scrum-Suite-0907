import { BarChart3, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SprintVelocityForm } from "@shared/schema";

interface HistoricalVelocityFormProps {
  data: Partial<SprintVelocityForm>;
  onUpdate: (updates: Partial<SprintVelocityForm>) => void;
}

export default function HistoricalVelocityForm({ data, onUpdate }: HistoricalVelocityFormProps) {
  const updateVelocity = (index: number, value: string) => {
    const newVelocities = [...(data.historicalVelocities || [0, 0, 0, 0, 0])];
    newVelocities[index] = parseFloat(value) || 0;
    onUpdate({ historicalVelocities: newVelocities });
  };

  const averageVelocity = data.historicalVelocities?.length === 5 
    ? data.historicalVelocities.reduce((sum, v) => sum + v, 0) / 5 
    : 0;

  return (
    <div className="form-card animate-fade-in hover:card-shadow-hover transition-all duration-300">
      <div className="flex items-center space-x-4 mb-8">
        <div className="icon-container bg-gradient-to-br from-blue-500 to-indigo-600">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold gradient-text">Historical Sprint Velocity</h2>
          <p className="text-muted-foreground">Enter story points completed in previous 5 sprints</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((sprintNum, index) => (
          <div key={sprintNum} className="space-y-3 group">
            <Label className="block text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              Sprint {sprintNum}
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={data.historicalVelocities?.[index] || ""}
              onChange={(e) => updateVelocity(index, e.target.value)}
              className="h-12 text-center text-lg font-medium border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-8 metric-card bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-blue-700">Historical Average</span>
              <p className="text-2xl font-bold text-blue-900">{averageVelocity.toFixed(1)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Story Points</span>
            <p className="text-sm text-blue-700">Per Sprint</p>
          </div>
        </div>
      </div>
    </div>
  );
}
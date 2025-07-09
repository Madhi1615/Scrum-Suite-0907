import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { TeamMetricConfig } from "@shared/schema";

interface MetricThresholdCardProps {
  config: TeamMetricConfig;
  onUpdate: (config: TeamMetricConfig, field: string, value: any) => void;
  isUpdating?: boolean;
}

export default function MetricThresholdCard({ 
  config, 
  onUpdate, 
  isUpdating = false 
}: MetricThresholdCardProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const getMetricInfo = (metricName: string) => {
    const info = {
      cpp_percentage: {
        name: "CPP % (Cost Per Point)",
        description: "Development cost efficiency - cost per story point delivered. Lower values = better efficiency.",
        example: "Target: <15% (excellent), 15-25% (acceptable), >25% (needs improvement)"
      },
      capex_percentage: {
        name: "CAPEX % (Capital Expenditure)", 
        description: "Budget spent on infrastructure vs operations. Tracks tooling and infrastructure investments.",
        example: "Target: 10-20% (optimal), <10% (underinvesting), >30% (over-investing)"
      },
      velocity_sp: {
        name: "Velocity (Story Points)",
        description: "Story points completed per sprint. Measures team delivery capacity and consistency.",
        example: "Target: 50+ SP (high performing), 30-50 SP (standard), <30 SP (needs support)"
      },
      dor_work_percentage: {
        name: "DOR Work % (Definition of Ready)",
        description: "Work items meeting Definition of Ready before sprint start. Higher is better.",
        example: "Target: >80% (excellent), 60-80% (good), <60% (needs improvement)"
      },
      critical_high_bugs: {
        name: "Critical/High Priority Bugs",
        description: "Critical and high priority bugs in production. Lower values = better quality.",
        example: "Target: 0-2 bugs (excellent), 3-5 bugs (acceptable), >5 bugs (critical)"
      },
      old_bugs: {
        name: "Old Bugs (>30 days)",
        description: "Bugs older than 30 days without resolution. Indicates technical debt buildup.",
        example: "Target: 0-3 bugs (good), 4-8 bugs (needs attention), >8 bugs (crisis)"
      },
      team_satisfaction: {
        name: "Team Satisfaction Score",
        description: "Team happiness and engagement (1-10 scale). Measures morale and work environment.",
        example: "Target: 8-10 (excellent), 6-7 (good), <6 (immediate attention needed)"
      },
      code_quality: {
        name: "Code Quality Score",
        description: "Automated quality metrics: test coverage, complexity, code review scores.",
        example: "Target: >85% (excellent), 70-85% (good), <70% (needs improvement)"
      }
    };
    return info[metricName as keyof typeof info] || { 
      name: metricName, 
      description: "Custom metric - configure based on your team's standards",
      example: "Set thresholds based on historical performance and goals"
    };
  };

  const handleFieldUpdate = (field: string, value: any) => {
    const updatedConfig = { ...localConfig, [field]: value };
    setLocalConfig(updatedConfig);
    onUpdate(config, field, value);
  };

  const validateThresholds = () => {
    const green = parseFloat(localConfig.greenThreshold || "0");
    const yellow = parseFloat(localConfig.yellowThreshold || "0");
    
    if (localConfig.isHigherBetter) {
      return yellow <= green;
    } else {
      return green <= yellow;
    }
  };

  const isValid = validateThresholds();
  const metricInfo = getMetricInfo(config.metricName);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>{metricInfo.name}</span>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              {!isValid && <AlertCircle className="w-4 h-4 text-red-500" />}
              {isValid && !isUpdating && <CheckCircle className="w-4 h-4 text-green-500" />}
            </CardTitle>
            <CardDescription className="space-y-2">
              <div>{metricInfo.description}</div>
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Example:</strong> {metricInfo.example}
              </div>
              <div className="text-xs text-gray-600">
                {localConfig.isHigherBetter ? "📈 Higher values are better" : "📉 Lower values are better"}
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`green-${config.id}`}>Green Threshold</Label>
            <Input
              id={`green-${config.id}`}
              type="number"
              value={localConfig.greenThreshold || ""}
              onChange={(e) => handleFieldUpdate("greenThreshold", e.target.value)}
              placeholder="50"
              className="border-green-200 focus:border-green-500"
            />
            <p className="text-xs text-green-600 mt-1">
              {localConfig.isHigherBetter ? "≥ this value" : "≤ this value"}
            </p>
          </div>
          <div>
            <Label htmlFor={`yellow-${config.id}`}>Yellow Threshold</Label>
            <Input
              id={`yellow-${config.id}`}
              type="number"
              value={localConfig.yellowThreshold || ""}
              onChange={(e) => handleFieldUpdate("yellowThreshold", e.target.value)}
              placeholder="35"
              className="border-yellow-200 focus:border-yellow-500"
            />
            <p className="text-xs text-yellow-600 mt-1">
              {localConfig.isHigherBetter ? "≥ this value" : "≤ this value"}
            </p>
          </div>
          <div>
            <Label htmlFor={`red-${config.id}`}>Red Threshold</Label>
            <Input
              id={`red-${config.id}`}
              type="number"
              value={localConfig.redThreshold || ""}
              onChange={(e) => handleFieldUpdate("redThreshold", e.target.value)}
              placeholder="0"
              className="border-red-200 focus:border-red-500"
              disabled
            />
            <p className="text-xs text-red-600 mt-1">
              {localConfig.isHigherBetter ? "< yellow value" : "> yellow value"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`higher-better-${config.id}`}
            checked={localConfig.isHigherBetter}
            onCheckedChange={(checked) => handleFieldUpdate("isHigherBetter", checked)}
          />
          <Label htmlFor={`higher-better-${config.id}`}>Higher values are better</Label>
        </div>

        {!isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">
                Invalid threshold configuration. Check your values.
              </span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Example Values</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-green-600">
              {localConfig.isHigherBetter ? "≥" : "≤"}{localConfig.greenThreshold || "50"}% = Green
            </div>
            <div className="text-yellow-600">
              {localConfig.isHigherBetter 
                ? `${localConfig.yellowThreshold || "35"}-${(parseInt(localConfig.greenThreshold || "50") - 1)}`
                : `${(parseInt(localConfig.greenThreshold || "50") + 1)}-${localConfig.yellowThreshold || "35"}`
              }% = Yellow
            </div>
            <div className="text-red-600">
              {localConfig.isHigherBetter ? "<" : ">"}{localConfig.yellowThreshold || "35"}% = Red
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
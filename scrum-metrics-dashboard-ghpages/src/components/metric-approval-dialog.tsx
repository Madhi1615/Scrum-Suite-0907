import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface MetricApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metric: {
    id: number;
    teamId: number;
    metricName: string;
    value: string;
    sprintNumber: string;
    actualColor: string;
  } | null;
}

export default function MetricApprovalDialog({ 
  isOpen, 
  onClose, 
  metric 
}: MetricApprovalDialogProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!metric) return;
      
      return await apiRequest(`/api/health-metrics/${metric.id}/approve`, {
        method: "PUT",
        body: JSON.stringify({
          comment: comment.trim() || undefined
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Metric Approved",
        description: "Red metric has been approved and marked as green.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/red-metrics"] });
      onClose();
      setComment("");
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!metric) return null;

  const getMetricDisplayName = (metricName: string) => {
    const names: Record<string, string> = {
      cpp_percentage: "CPP %",
      capex_percentage: "CAPEX %", 
      velocity_sp: "Velocity (SP)",
      dor_work_percentage: "DOR Work %",
      critical_high_bugs: "Critical/High Bugs",
      old_bugs: "Old Bugs",
      team_satisfaction: "Team Satisfaction",
      code_quality: "Code Quality"
    };
    return names[metricName] || metricName;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Approve Red Metric</span>
          </DialogTitle>
          <DialogDescription>
            This metric is currently marked as red. As a Product Owner, you can approve 
            it to override the color to green.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Metric:</span>
              <span>{getMetricDisplayName(metric.metricName)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sprint:</span>
              <span>{metric.sprintNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Value:</span>
              <span className="font-mono">{metric.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Current Status:</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                Red (Critical)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Approval Comment (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain why this red metric is acceptable (e.g., 'Expected due to planned refactoring', 'One-time issue resolved')..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {approveMutation.isPending ? "Approving..." : "Approve as Green"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
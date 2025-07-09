import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SprintVelocityForm, VelocityTeamMember } from "@shared/schema";

interface TeamManagementFormProps {
  data: Partial<SprintVelocityForm>;
  onUpdate: (updates: Partial<SprintVelocityForm>) => void;
}

export default function TeamManagementForm({ data, onUpdate }: TeamManagementFormProps) {
  const updateTeamSize = (size: number) => {
    const currentMembers = data.teamMembers || [];
    let newMembers: VelocityTeamMember[] = [];
    
    for (let i = 0; i < size; i++) {
      if (i < currentMembers.length) {
        newMembers.push(currentMembers[i]);
      } else {
        newMembers.push({
          id: `member-${i + 1}`,
          name: "",
          role: "fullstack",
          capacityFactor: 1.0,
          absentDates: [],
          attendancePercentage: 100,
          effectiveCapacity: 100,
        });
      }
    }
    
    onUpdate({ teamSize: size, teamMembers: newMembers });
  };

  const updateTeamMember = (index: number, updates: Partial<VelocityTeamMember>) => {
    const newMembers = [...(data.teamMembers || [])];
    newMembers[index] = { ...newMembers[index], ...updates };
    onUpdate({ teamMembers: newMembers });
  };

  const roleLabels = {
    frontend: "Frontend Developer",
    backend: "Backend Developer",
    fullstack: "Full Stack Developer",
    qa: "QA Engineer",
    devops: "DevOps Engineer",
  };

  const capacityLabels = {
    0.5: "50% (Part-time)",
    0.7: "70% (Other duties)",
    1.0: "100% (Full-time)",
  };

  return (
    <div className="form-card animate-fade-in hover:card-shadow-hover transition-all duration-300" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="icon-container bg-gradient-to-br from-emerald-500 to-teal-600">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Team Configuration</h2>
            <p className="text-muted-foreground">Define team size and member details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Label className="text-sm font-semibold text-gray-700">Team Size:</Label>
          <Select 
            value={data.teamSize?.toString() || "5"} 
            onValueChange={(value) => updateTeamSize(parseInt(value))}
          >
            <SelectTrigger className="w-36 h-10 rounded-xl border-2 focus:ring-2 focus:ring-emerald-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 4, 5, 6, 7, 8].map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size} members
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {data.teamMembers?.map((member, index) => (
          <div key={member.id} className="metric-card bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-100 hover:border-emerald-200 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="block text-sm font-semibold text-gray-700">Member Name</Label>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, { name: e.target.value })}
                  className="h-11 rounded-xl border-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-3">
                <Label className="block text-sm font-semibold text-gray-700">Role</Label>
                <Select 
                  value={member.role} 
                  onValueChange={(value) => updateTeamMember(index, { role: value as any })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-2 focus:ring-2 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="block text-sm font-semibold text-gray-700">Capacity Factor</Label>
                <Select 
                  value={member.capacityFactor.toString()} 
                  onValueChange={(value) => updateTeamMember(index, { capacityFactor: parseFloat(value) })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-2 focus:ring-2 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(capacityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-emerald-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Member {index + 1}</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Capacity</span>
                <p className="text-lg font-bold text-emerald-700">{(member.capacityFactor * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Calendar, Calculator, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { SprintVelocityForm, VelocityHoliday } from "@shared/schema";
import { differenceInBusinessDays, parseISO, format } from "date-fns";

interface SprintPlanningFormProps {
  data: Partial<SprintVelocityForm>;
  onUpdate: (updates: Partial<SprintVelocityForm>) => void;
  onCalculate: () => void;
  isCalculateDisabled: boolean;
}

export default function SprintPlanningForm({ 
  data, 
  onUpdate, 
  onCalculate, 
  isCalculateDisabled 
}: SprintPlanningFormProps) {
  
  const addHoliday = () => {
    const newHoliday: VelocityHoliday = {
      id: `holiday-${Date.now()}`,
      date: "",
      name: "",
    };
    onUpdate({ 
      holidays: [...(data.holidays || []), newHoliday] 
    });
  };

  const removeHoliday = (id: string) => {
    onUpdate({ 
      holidays: data.holidays?.filter(h => h.id !== id) || [] 
    });
  };

  const updateHoliday = (id: string, updates: Partial<VelocityHoliday>) => {
    const newHolidays = data.holidays?.map(h => 
      h.id === id ? { ...h, ...updates } : h
    ) || [];
    onUpdate({ holidays: newHolidays });
  };

  const updateTeamMemberAbsentDates = (memberIndex: number, dateIndex: number, date: string) => {
    const newMembers = [...(data.teamMembers || [])];
    const member = newMembers[memberIndex];
    if (member) {
      const newAbsentDates = [...member.absentDates];
      if (date === "") {
        newAbsentDates.splice(dateIndex, 1);
      } else {
        newAbsentDates[dateIndex] = date;
      }
      member.absentDates = newAbsentDates;
      onUpdate({ teamMembers: newMembers });
    }
  };

  const addAbsentDate = (memberIndex: number) => {
    const newMembers = [...(data.teamMembers || [])];
    const member = newMembers[memberIndex];
    if (member) {
      member.absentDates = [...member.absentDates, ""];
      onUpdate({ teamMembers: newMembers });
    }
  };

  const getSprintDuration = () => {
    if (!data.sprintStartDate || !data.sprintEndDate) return 0;
    try {
      const start = parseISO(data.sprintStartDate);
      const end = parseISO(data.sprintEndDate);
      return differenceInBusinessDays(end, start) + 1;
    } catch {
      return 0;
    }
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

  const sprintDuration = getSprintDuration();

  return (
    <div className="form-card animate-fade-in hover:card-shadow-hover transition-all duration-300" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center space-x-4 mb-8">
        <div className="icon-container bg-gradient-to-br from-amber-500 to-orange-600">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold gradient-text">Upcoming Sprint Planning</h2>
          <p className="text-muted-foreground">Define sprint dates and track attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">Team Name</Label>
            <Input
              type="text"
              placeholder="Enter team name"
              value={data.teamName || ""}
              onChange={(e) => onUpdate({ teamName: e.target.value })}
              className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">Sprint Start Date</Label>
            <Input
              type="date"
              value={data.sprintStartDate || ""}
              onChange={(e) => onUpdate({ sprintStartDate: e.target.value })}
              className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">Sprint End Date</Label>
            <Input
              type="date"
              value={data.sprintEndDate || ""}
              onChange={(e) => onUpdate({ sprintEndDate: e.target.value })}
              className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="metric-card bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Sprint Duration</h3>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {sprintDuration}
                </p>
                <p className="text-sm text-amber-600">working days</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-xs text-amber-600">Excluding weekends and holidays</p>
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Management */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-900">National Holidays & Non-working Days</h3>
          <Button
            onClick={addHoliday}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Holiday
          </Button>
        </div>
        <div className="space-y-2">
          {data.holidays?.map((holiday) => (
            <div key={holiday.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Input
                type="date"
                value={holiday.date}
                onChange={(e) => updateHoliday(holiday.id, { date: e.target.value })}
                className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <Input
                type="text"
                placeholder="Holiday name"
                value={holiday.name}
                onChange={(e) => updateHoliday(holiday.id, { name: e.target.value })}
                className="flex-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <Button
                onClick={() => removeHoliday(holiday.id)}
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Tracking */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Individual Attendance Planning</h3>
        <div className="space-y-4">
          {data.teamMembers?.map((member, memberIndex) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getAvatarColor(memberIndex)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                      {getInitials(member.name || `Member ${memberIndex + 1}`)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {member.name || `Member ${memberIndex + 1}`}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)} Developer
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Planned Attendance: <span className="text-emerald-600">
                      {member.attendancePercentage.toFixed(0)}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((sprintDuration - member.absentDates.filter(d => d).length) * member.capacityFactor)} out of {sprintDuration} days
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">Absent Dates (if any)</Label>
                <div className="flex flex-wrap gap-2">
                  {member.absentDates.map((date, dateIndex) => (
                    <Input
                      key={dateIndex}
                      type="date"
                      value={date}
                      onChange={(e) => updateTeamMemberAbsentDates(memberIndex, dateIndex, e.target.value)}
                      className="w-auto text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  ))}
                  <Button
                    onClick={() => addAbsentDate(memberIndex)}
                    size="sm"
                    variant="outline"
                    className="border-2 border-dashed border-gray-300 text-gray-500 hover:border-amber-500 hover:text-amber-600"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Date
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button 
          onClick={onCalculate}
          disabled={isCalculateDisabled}
          className="btn-primary w-full py-4 text-lg font-semibold"
        >
          <Calculator className="w-6 h-6 mr-3" />
          Calculate Sprint Velocity
        </Button>
      </div>
    </div>
  );
}
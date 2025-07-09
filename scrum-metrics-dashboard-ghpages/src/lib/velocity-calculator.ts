import { differenceInBusinessDays, parseISO, isWithinInterval } from "date-fns";
import type { SprintVelocityForm, VelocityCalculationResult, VelocityTeamMember } from "@shared/schema";

export function calculateSprintVelocity(data: SprintVelocityForm): VelocityCalculationResult {
  // Calculate average historical velocity
  const averageHistoricalVelocity = data.historicalVelocities.reduce((sum, v) => sum + v, 0) / data.historicalVelocities.length;

  // Calculate sprint duration (business days)
  const sprintStart = parseISO(data.sprintStartDate);
  const sprintEnd = parseISO(data.sprintEndDate);
  const totalSprintDays = differenceInBusinessDays(sprintEnd, sprintStart) + 1;

  // Calculate working days (excluding holidays)
  let workingDays = totalSprintDays;
  data.holidays.forEach(holiday => {
    if (holiday.date) {
      const holidayDate = parseISO(holiday.date);
      if (isWithinInterval(holidayDate, { start: sprintStart, end: sprintEnd })) {
        workingDays--;
      }
    }
  });

  // Calculate team capacity
  const teamMembersWithCapacity = data.teamMembers.map(member => {
    // Count valid absent dates within sprint period
    const validAbsentDates = member.absentDates.filter(date => {
      if (!date) return false;
      try {
        const absentDate = parseISO(date);
        return isWithinInterval(absentDate, { start: sprintStart, end: sprintEnd });
      } catch {
        return false;
      }
    });

    // Calculate effective working days for this member
    const memberWorkingDays = workingDays - validAbsentDates.length;
    const effectiveDays = memberWorkingDays * member.capacityFactor;
    const effectiveCapacity = (effectiveDays / workingDays) * 100;

    return {
      ...member,
      effectiveCapacity: Math.max(0, effectiveCapacity),
    };
  });

  // Calculate overall team capacity
  const totalTeamCapacity = teamMembersWithCapacity.reduce((sum, member) => sum + member.effectiveCapacity, 0) / data.teamMembers.length;

  // Calculate projected velocity
  const capacityFactor = totalTeamCapacity / 100;
  const projectedVelocity = averageHistoricalVelocity * capacityFactor;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (capacityFactor < 0.8) {
    const reduction = Math.round((1 - capacityFactor) * averageHistoricalVelocity);
    recommendations.push(`Consider reducing sprint scope by ${reduction} story points due to reduced capacity`);
  }

  const lowCapacityMembers = teamMembersWithCapacity.filter(m => m.effectiveCapacity < 70);
  if (lowCapacityMembers.length > 0) {
    lowCapacityMembers.forEach(member => {
      recommendations.push(`${member.name}'s limited availability (${member.effectiveCapacity.toFixed(0)}%) may impact ${member.role} work`);
    });
  }

  if (data.holidays.length > 0) {
    recommendations.push(`${data.holidays.length} holiday(s) during sprint affect overall team productivity`);
  }

  if (workingDays < 8) {
    recommendations.push("Short sprint duration may limit velocity - consider adjusting scope accordingly");
  }

  return {
    projectedVelocity,
    averageHistoricalVelocity,
    teamCapacity: totalTeamCapacity,
    workingDays,
    totalSprintDays,
    recommendations,
    teamMembersWithCapacity,
  };
}
import { useAuth } from "@/hooks/useAuth";
import TeamAnalyticsDashboard from "@/components/team-analytics-dashboard";

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  // Determine user role based on user data
  // In a real application, this would come from user permissions/roles
  const userRole = "admin"; // Default to admin for demo purposes

  return (
    <div className="container mx-auto p-6">
      <TeamAnalyticsDashboard userRole={userRole} />
    </div>
  );
}
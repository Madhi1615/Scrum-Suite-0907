import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, MessageSquare, TrendingUp, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Scrum Suite</h1>
        <p className="text-gray-600">Access all your team management applications from one unified dashboard</p>
      </div>

      {/* Application Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/team-health">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <CardTitle className="text-lg">Team Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Track team performance with configurable color-coded metrics across all your teams
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                <span>{teams?.length || 0} Teams Active</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/velocity">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Updated</Badge>
              </div>
              <CardTitle className="text-lg">Sprint Velocity Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Calculate and track team velocity across sprints with historical trending
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>Real-time tracking</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/retrospective">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Live</Badge>
              </div>
              <CardTitle className="text-lg">Retrospective Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Conduct digital retrospectives with team feedback and action item tracking
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Interactive boards</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {teams?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">Active</div>
              <div className="text-sm text-gray-500">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">Latest</div>
              <div className="text-sm text-gray-500">App Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
              <div className="text-sm text-gray-500">Support</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/team-config">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Configure Teams
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Retrospective
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

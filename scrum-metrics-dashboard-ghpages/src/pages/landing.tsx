import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, MessageSquare, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Scrum Suite</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The complete scrum management platform for modern development teams. 
            Track team health, calculate velocity, and conduct retrospectives all in one place.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="px-8 py-3 text-lg"
          >
            Sign In to Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Team Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor team performance with configurable color-coded metrics. 
                Track progress across multiple teams with customizable thresholds.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Sprint Velocity Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Calculate and track team velocity across sprints with attendance tracking 
                and historical trending for better sprint planning.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Digital Retrospectives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Conduct effective retrospectives with digital boards for feedback collection, 
                action item tracking, and team improvement initiatives.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Scrum Suite?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Unified Dashboard</h3>
                <p className="text-gray-600">
                  Access all your scrum tools from one place. No more switching between multiple applications.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-Team Support</h3>
                <p className="text-gray-600">
                  Manage 20+ teams with team-specific configurations and independent data tracking.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Configurable Metrics</h3>
                <p className="text-gray-600">
                  Set custom thresholds for each team and metric. Get color-coded insights at a glance.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <MessageSquare className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Deployment</h3>
                <p className="text-gray-600">
                  Simple setup and deployment process designed for non-technical users.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to streamline your scrum process?
          </h2>
          <p className="text-gray-600 mb-6">
            Join teams already using Scrum Suite to improve their agile workflow.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="px-8 py-3"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}

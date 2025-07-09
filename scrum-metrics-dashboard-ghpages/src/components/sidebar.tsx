import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  Download,
  X,
  Menu,
  Target,
  BarChart
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Team Health", href: "/team-health", icon: Users },
  { name: "Sprint Velocity", href: "/velocity", icon: TrendingUp },
  { name: "Retrospective", href: "/retrospective", icon: MessageSquare },
];

const quickActions = [
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Team Config", href: "/team-config", icon: Settings },
  { name: "Threshold Config", href: "/threshold-config", icon: Target },
  { name: "Export Data", href: "#", icon: Download },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 sidebar-transition transform lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Scrum Suite</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "nav-item text-gray-700",
                    isActive && "active"
                  )}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {quickActions.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "nav-item text-gray-700",
                      isActive && "active"
                    )}
                    onClick={() => {
                      // Close mobile sidebar when navigating
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

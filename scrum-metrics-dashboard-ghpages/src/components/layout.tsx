import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";

const PAGE_TITLES = {
  "/": { title: "Dashboard", subtitle: "Manage your scrum teams and track progress" },
  "/team-health": { title: "Team Health Metrics", subtitle: "Monitor team performance with configurable thresholds" },
  "/velocity": { title: "Sprint Velocity Calculator", subtitle: "Track and calculate team velocity across sprints" },
  "/retrospective": { title: "Sprint Retrospective", subtitle: "Collect team feedback and track action items" },
  "/team-config": { title: "Team Configuration", subtitle: "Configure thresholds and settings for each team" },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Close sidebar when location changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const currentPage = PAGE_TITLES[location as keyof typeof PAGE_TITLES] || PAGE_TITLES["/"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-0">
        <Header 
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

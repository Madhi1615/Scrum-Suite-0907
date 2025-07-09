import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";
import RoleSelector, { getRolePermissions } from "./role-selector";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || "scrum_master");
  
  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const permissions = getRolePermissions(currentRole);
  
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "SM";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "Scrum Master";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Team Selector */}
          {teams && teams.length > 0 && (
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team: any) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Role & User Profile */}
          <div className="flex items-center space-x-3">
            <RoleSelector 
              currentRole={currentRole}
              onRoleChange={setCurrentRole}
            />
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-700">
                {getUserDisplayName()}
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

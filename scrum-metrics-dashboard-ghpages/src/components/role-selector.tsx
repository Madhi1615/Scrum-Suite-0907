import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Shield, Users, ChevronDown } from "lucide-react";

const ROLES = [
  { value: "admin", label: "Admin", icon: Shield, color: "bg-red-100 text-red-800" },
  { value: "product_owner", label: "Product Owner", icon: UserCheck, color: "bg-blue-100 text-blue-800" },
  { value: "scrum_master", label: "Scrum Master", icon: Users, color: "bg-green-100 text-green-800" },
];

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  className?: string;
}

export default function RoleSelector({ currentRole, onRoleChange, className }: RoleSelectorProps) {
  const currentRoleData = ROLES.find(r => r.value === currentRole) || ROLES[2];
  const Icon = currentRoleData.icon;

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Icon className="w-4 h-4" />
            <Badge variant="secondary" className={currentRoleData.color}>
              {currentRoleData.label}
            </Badge>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
            Switch Role (Testing)
          </div>
          {ROLES.map((role) => {
            const RoleIcon = role.icon;
            return (
              <DropdownMenuItem
                key={role.value}
                onClick={() => onRoleChange(role.value)}
                className="flex items-center space-x-2"
              >
                <RoleIcon className="w-4 h-4" />
                <span>{role.label}</span>
                {currentRole === role.value && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Current
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const getRolePermissions = (role: string) => {
  switch (role) {
    case "admin":
      return {
        canEditConfig: true,
        canEnterData: true,
        canApprove: true,
        canViewAll: true,
        canManageTeams: true,
        label: "Full Access"
      };
    case "product_owner":
      return {
        canEditConfig: false,
        canEnterData: false,
        canApprove: true,
        canViewAll: true,
        canManageTeams: false,
        label: "Approval & Analytics"
      };
    case "scrum_master":
    default:
      return {
        canEditConfig: false,
        canEnterData: true,
        canApprove: false,
        canViewAll: false,
        canManageTeams: false,
        label: "Data Entry"
      };
  }
};
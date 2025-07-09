import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./useAuth";
import { getRolePermissions } from "@/components/role-selector";

interface RoleContextType {
  currentRole: string;
  setCurrentRole: (role: string) => void;
  permissions: ReturnType<typeof getRolePermissions>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function useRoleState() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || "scrum_master");
  
  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const permissions = getRolePermissions(currentRole);

  return {
    currentRole,
    setCurrentRole,
    permissions
  };
}
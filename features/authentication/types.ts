import { UserRole } from "@/developer-console/types/developerConsole.types";

export interface SignInCredentials {
  email: string;
  password?: string;
  role?: UserRole;
  rememberMe?: boolean;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  workspaceName: string;
  category: string;
}

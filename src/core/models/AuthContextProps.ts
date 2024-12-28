export interface AuthContextProps {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}
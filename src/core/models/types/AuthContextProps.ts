export interface AuthContextProps {
  isAuthenticated: boolean;
  userRole: string | null;
  userId: number | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}
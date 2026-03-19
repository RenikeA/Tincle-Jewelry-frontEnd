import { create } from "zustand";
import { AuthService } from "../lib/api";
import { tokenStorage } from "../lib/apiClient";
import { User, LoginPayload, RegisterPayload } from "../types/user";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

const normalizeAuthResponse = (response: any) => {
  const user: User = {
    id: response.id ?? "",
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    phone: response.phone,
    avatar: response.avatar,
    role: response.role,
    emailVerified: response.emailVerified ?? false,
    createdAt: response.createdAt ?? new Date().toISOString(),
  };

  const tokens = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresIn: response.expiresIn,
    tokenType: "Bearer" as const,
  };

  return { user, tokens };
};

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(payload);
      const { user, tokens } = normalizeAuthResponse(response);
      if (!tokens.accessToken) throw new Error("Invalid response from server");
      tokenStorage.setTokens(tokens);
      set({ user, isAuthenticated: true });
      return true;
    } catch (err: unknown) {
      let msg = "Invalid email or password";
      if (err instanceof Error && err.message) {
        msg = err.message;
      } else {
        msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? "Invalid email or password";
      }
      set({ error: msg });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(payload);
      const { user, tokens } = normalizeAuthResponse(response);
      if (!tokens.accessToken) throw new Error("Invalid response from server");
      tokenStorage.setTokens(tokens);
      set({ user, isAuthenticated: true });
      return true;
    } catch (err: unknown) {
      let msg = "Registration failed";
      if (err instanceof Error && err.message) {
        msg = err.message;
      } else {
        msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? "Registration failed";
      }
      set({ error: msg });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
    } finally {
      tokenStorage.clearAll();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  restoreSession: async () => {
    const token = tokenStorage.getAccess();
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await AuthService.getMe();
      set({ user, isAuthenticated: true });
    } catch {
      tokenStorage.clearAll();
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

window.addEventListener("auth:logout", () => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
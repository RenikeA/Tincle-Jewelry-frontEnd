import { post } from "../lib/apiClient";
import { RegisterPayload, LoginResponse, AuthTokens } from "../types/user";

export const register = async (userData: RegisterPayload): Promise<LoginResponse> => {
  try {
    const response = await post<LoginResponse>('/auth/register', userData);
    return response;
  } catch (error: any) {
    // Enhanced error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const response = await post<AuthTokens>('/auth/login', { email, password });
  return response;
};
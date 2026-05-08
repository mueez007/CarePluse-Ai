"use client";

import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        localStorage.setItem("carepulse_user", JSON.stringify(data.user));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || "Failed to sign in" };
      }

      setUser(data.user);
      localStorage.setItem("carepulse_user", JSON.stringify(data.user));
      return { error: null };
    } catch {
      return { error: "An unexpected error occurred" };
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || "Failed to create account" };
      }

      setUser(data.user);
      localStorage.setItem("carepulse_user", JSON.stringify(data.user));
      return { error: null };
    } catch {
      return { error: "An unexpected error occurred" };
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("carepulse_user");
    localStorage.removeItem("onboarding_completed");
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };
}

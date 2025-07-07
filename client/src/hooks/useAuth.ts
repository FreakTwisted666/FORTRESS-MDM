import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("fortress_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("fortress_user", JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("fortress_user");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

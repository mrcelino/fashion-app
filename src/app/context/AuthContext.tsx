"use client";
import { createContext, useContext, useEffect, useState } from "react";

type UserType = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  phone: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  photo: string;
  description: string;
  is_active: boolean;
  weekly_donation_quota: number;
  weekly_donation_used: number;
  quota_reset_date: string;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  setUser: (user: UserType | null) => void;
  setToken: (token: string | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  setUser: () => {},
  setToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);

        const res = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Gagal mengambil data user");

        const result = await res.json();
        if (result && result.data) {
          setUser(result.data);
        } else {
          throw new Error("User tidak ditemukan");
        }
      } catch (error) {
        console.error("Auth init error:", error);
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

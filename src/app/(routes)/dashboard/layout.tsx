"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="pt-20 md:pt-24 min-h-screen ml-80 px-4 md:px-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}

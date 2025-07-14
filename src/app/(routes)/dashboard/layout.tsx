import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import {AuthProvider} from "../../context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-20 md:pt-24 min-h-screen ml-80 px-4 md:px-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}

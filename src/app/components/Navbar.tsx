"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <div className="navbar bg-white fixed top-0 left-0 w-full z-50 p-2 shadow-sm flex items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Info />
        </div>

        {/* Profile Desktop */}
        <div className="hidden md:flex items-center space-x-10">
          <Profile/>
        </div>

        {/* Hamburger Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="p-2 bg-white rounded-full hover:bg-[#285A22] transition duration-300"
          >
            <Image src="/hamburger.png" alt="menu icon" width={24} height={24} />
          </button>
        </div>
      </div>

      {/* Dropdown Mobile */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-white shadow-md rounded-b-xl flex flex-col items-center py-4 space-y-4 md:hidden z-50">
          <MobileMenu onClose={() => setIsMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}

function Info() {
  return (
    <>
      <Link href="/dashboard" className="text-base text-black md:text-xl font-semibold">
        SatuLemari
      </Link>
    </>
  );
}


function Profile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, setUser, setToken, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
          <img
            src={user?.photo || "/user.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <svg
          className="w-4 h-4 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={user?.photo || "/user.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {loading ? "Loading..." : user?.username || "-"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || "-"}</p>
                </div>
              </div>
            </div>

            <div className="px-2 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
              >
                <span>Logout</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Overlay untuk tutup dropdown saat klik luar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        </>
      )}
    </div>
  );
}

export default Profile;


function MobileMenu({ onClose }: { onClose: () => void }) {


  return (
    <>



    </>
  );
}

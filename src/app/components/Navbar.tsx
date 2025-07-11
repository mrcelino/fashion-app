"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
      <Link href="/dashboard" className="text-base md:text-xl font-semibold">
        SatuLemari
      </Link>
    </>
  );
}


function Profile({ user, loading, handleLogout }: any) {
  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn rounded-full p-0 size-12 overflow-hidden"
      >
        <img
          src="/user.png"
          className="size-11 object-cover"
        />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu min-w-60 max-w-2xl h-fit bg-base-100 rounded-2xl z-1 mt-2 p-3 shadow-md"
      >
        <div className="flex items-center justify-start gap-4 max-w-2xl min-h-16 border-2 border-gray-200 p-2 rounded-xl shadow-2xs mb-2">
          <div className="rounded-full size-10 overflow-hidden">
            <img
              src="/user.png"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-col">
            <p className="font-semibold text-base">
              {loading ? "Loading..." : user ? user.nama_depan : "Marcelino"}
            </p>
          </div>
        </div>
        <div
          onClick={handleLogout}
          className="flex justify-between pr-4 bg-white hover:bg-pink hover:text-white rounded-3xl px-5 py-2 font-semibold transition duration-300 hover:scale-105 cursor-pointer"
        >
          <span>Logout</span>
          <img
            src="/logout.svg"
            alt="Logout Icon"
            className="size-4 object-cover"
          />
        </div>
      </ul>
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

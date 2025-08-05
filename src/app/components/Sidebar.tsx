"use client";
import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoHome } from 'react-icons/go';
import { PiTShirt } from "react-icons/pi";
import { LuClipboardList } from "react-icons/lu";
import { IoMdAdd } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";


export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: GoHome },
    { href: "/dashboard/listings", label: "Etalaseku", icon: PiTShirt },
    { href: "/dashboard/activity", label: "Aktivitas", icon: LuClipboardList },
    { href: "/dashboard/add-items", label: "Tambah Barang", icon: IoMdAdd },
    { href: "/dashboard/profile", label: "Pengaturan Akun", icon: FaRegUserCircle },
  ];

  return (
    <div className="hidden lg:block fixed pt-24 left-0 h-full w-80 p-6 text-black overflow-y-auto bg-white border-r border-gray-200 shadow-lg">
      <nav>
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon : Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className="relative flex items-center p-3 rounded-xl transition duration-300 group hover:bg-gray-100"
                >
                  <span
                    className={`absolute inset-0 rounded-xl bg-green-400 transition-opacity duration-300   ${
                      isActive ? "opacity-100" : "opacity-0 "
                    }`}
                  ></span>
                  <span className="relative flex space-x-5 items-center">
                    {/* Icon */}
                    <Icon size={24} color={isActive ? 'white' : 'black'} />

                    {/* Label */}
                    <span className={`font-medium ${isActive ? 'text-white font-semibold' : 'text-black'}`}>
                      {label}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

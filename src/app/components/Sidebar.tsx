"use client";
import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: "/nav-home.svg" },
    { href: "/dashboard/listings", label: "Etalaseku", icon: "/nav-listings.svg" },
    { href: "/dashboard/activity", label: "Aktivitas", icon: "/nav-activity.svg" },
    { href: "/dashboard/add-items", label: "Tambah Item", icon: "/nav-add.svg" },
    { href: "/dashboard/profile", label: "Pengaturan Akun", icon: "/nav-profile.svg" },
  ];

  return (
    <div className="fixed pt-24 left-0 h-full w-80 p-6 text-white overflow-y-auto bg-[#3D74B6]">
      <nav>
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className="relative flex items-center p-3 rounded-xl transition duration-300 group hover:bg-[#2D5A8B]"
                >
                  <span
                    className={`absolute inset-0 rounded-xl bg-[#5B90D1] transition-opacity duration-300   ${
                      isActive ? "opacity-100" : "opacity-0 "
                    }`}
                  ></span>
                  <span className="relative flex space-x-5 items-center">
                    <img src={icon} alt={`${label} icon`} className="w-6 h-6" />
                    <span className='font-medium'>{label}</span>
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

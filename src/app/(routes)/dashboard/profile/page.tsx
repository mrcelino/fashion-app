"use client"; // Diperlukan jika menggunakan hook seperti useState di Next.js App Router

import type { FC } from 'react';
import MapPicker from '../../../components/MapPicker/MapPicker';
import React, { useState, useRef, useEffect } from 'react';

// --- Tipe Data ---
type InputFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
};

type CustomDropdownProps = {
  label: string;
  placeholder: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

// --- Komponen ---

// InputField tetap sama, tidak ada perubahan
const InputField: FC<InputFieldProps> = ({ label, placeholder, type = 'text' }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-0"
    />
  </div>
);

// Komponen SelectField diganti dengan CustomDropdown
const CustomDropdown: FC<CustomDropdownProps> = ({ label, placeholder, options, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook untuk menutup dropdown saat klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm text-left flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        <span className={selectedValue ? 'text-gray-900' : 'text-gray-400'}>
          {selectedValue || placeholder}
        </span>
        {/* Ikon panah ke bawah */}
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className="p-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Komponen Halaman Utama ---
const Page: FC = () => {  
  return (
      <div className="flex flex-col justify-center gap-4 ">
      <h2 className="text-2xl font-bold text-gray-800">Pengaturan</h2>
      <h2 className="text-lg font-semibold text-gray-800">🏬 Profil Bisnis / Komunitas / Pribadi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Kolom Kiri */}
        <div className="flex flex-col gap-y-5">
          <InputField 
            label="Nama" 
            placeholder="Nama" 
          />
          <InputField 
            label="Alamat Lengkap" 
            placeholder="Alamat" 
          />
          <InputField 
            label="Kota / Kabupaten" 
            placeholder="Kota / Kabupaten" 
          />
          <InputField 
            label="Kontak" 
            placeholder="Kontak" 
            type="number" 
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              placeholder="Deskripsi"
              className="w-full h-fit border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-24 resize-none outline-0"
            ></textarea>
          </div>

        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-2">
            <MapPicker />
          </div>

          <div className="flex justify-end gap-4">
            <button className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition cursor-pointer">
              Kosongkan Formulir
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition cursor-pointer">
              Simpan Barang
            </button>
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}

    </div>
  );
}

export default Page;
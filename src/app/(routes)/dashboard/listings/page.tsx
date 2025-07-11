"use client";
import React from 'react';
import Image from 'next/image';

// Tipe untuk props yang diterima oleh ProductCard
type ProductCardProps = {
  activeTab: 'Donasi' | 'Sewa';
};

// --- Komponen Kartu Produk ---
const ProductCard: React.FC<ProductCardProps> = ({ activeTab }) => {
  return (
    <div className="flex flex-col gap-1 border-gray-200 border-2 rounded-3xl p-3 min-h-40">
      <Image src="/shirt.webp" alt="shirt" width={200} height={200} className='w-full h-60 object-cover rounded-t-3xl'/>
      <h2 className="text-base font-semibold mt-1">Long Sleeve Stretch Shirt</h2>
      
      <h2 className="text-sm">
        {activeTab === 'Sewa' && (
          <span className='text-sm'>Rp40.000 | </span>
        )}
        Size: M | Shirt
      </h2>
      
      <div className='flex flex-row justify-between items-center'>
        <div className='flex items-center gap-2'>
          <div className='rounded-full size-3 bg-[#48FF00]'></div>
          <h2 className='text-sm'>Aktif</h2>
        </div>
        <h2 className="text-sm">Tersedia 3 dari 4</h2>  
      </div>

      <div className='flex justify-between items-center mt-1 pt-2 border-t border-gray-200'>
        <a href="#" className="text-sm hover:text-blue-600 hover:scale-105 cursor-pointer transition duration-300">
          Lihat Aktivitas
        </a>
        <button className='bg-[#00AEFF] text-white text-sm px-5 py-1.5 rounded-full hover:bg-blue-500 hover:scale-105 cursor-pointer transition duration-300'>
          Kelola
        </button>
      </div>
    </div>
  );
}

// Tipe untuk props yang diterima oleh TabContent
type TabContentProps = {
  tabType: 'Donasi' | 'Sewa';
};

// --- Komponen Konten Tab ---
const TabContent: React.FC<TabContentProps> = ({ tabType }) => (
  <div className="flex flex-col gap-4">
    <p className="text-gray-600">
      {tabType === 'Donasi' 
        ? 'Di sini adalah tempat untuk menampilkan daftar inventaris yang didonasikan.'
        : 'Di sini adalah tempat untuk menampilkan daftar inventaris yang disewakan.'
      }
    </p>
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
      </div>
      <input
        type="text"
        id={`search-${tabType}`}
        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-2xl bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Cari dengan nama item..."
      />
    </div>
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 rounded-full shadow-sm whitespace-nowrap">
        Semua
      </button>
      <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-700 bg-transparent border border-gray-300 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
        Kategori
        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-700 bg-transparent border border-gray-300 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
        Size
        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <button className="px-4 py-1.5 text-sm font-semibold text-gray-700 bg-transparent border border-gray-300 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
        Terbaru
      </button>
      <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-700 bg-transparent border border-gray-300 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
        Status
        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <ProductCard activeTab={tabType} />
      <ProductCard activeTab={tabType} />
      <ProductCard activeTab={tabType} />
      <ProductCard activeTab={tabType} />
      <ProductCard activeTab={tabType} />
      <ProductCard activeTab={tabType} />
    </div>
  </div>
);


// --- Komponen Halaman Utama ---
export default function Page() {
  const [activeTab, setActiveTab] = React.useState<'Donasi' | 'Sewa'>('Donasi');

  return (
    <div className="flex flex-col justify-center gap-4">
      <h2 className="font-semibold text-2xl">Inventaris</h2>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('Donasi')}
          className={`px-4 py-2 font-semibold text-base transition-colors duration-300 cursor-pointer ${
            activeTab === 'Donasi' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          Donasi
        </button>
        <button
          onClick={() => setActiveTab('Sewa')}
          className={`px-4 py-2 font-semibold text-base transition-colors duration-300 cursor-pointer ${
            activeTab === 'Sewa' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          Sewa
        </button>
      </div>

      <div>
        {activeTab === 'Donasi' && <TabContent tabType="Donasi" />}
        {activeTab === 'Sewa' && <TabContent tabType="Sewa" />}
      </div>
    </div>
  );
}
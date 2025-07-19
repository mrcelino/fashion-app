"use client";
import React, { useState, useEffect} from 'react';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { Spinner } from '@/app/components/Spinner';
import { ProductCard, Product } from '@/app/components/ProductCard';

type FilterState = {
  status: string;
  minPrice: string;
  maxPrice: string;
  size: string;
  color: string;
  sortOrder: 'desc' | 'asc';
  search: string;
};

// --- Komponen Konten Tab dengan UI yang diperbaiki ---
const TabContent = ({ tabType }: { tabType: 'Donasi' | 'Sewa' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    color: '',
    sortOrder: 'desc',
    search: ''
  });

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        
        const apiType = tabType === 'Donasi' ? 'donation' : 'rental';
        params.append('type', apiType);
        
        if (filters.status) params.append('status', filters.status);
        if (filters.minPrice) params.append('min_price', filters.minPrice);
        if (filters.maxPrice) params.append('max_price', filters.maxPrice);
        if (filters.size) params.append('size', filters.size);
        if (filters.color) params.append('color', filters.color);
        if (filters.search) params.append('search', filters.search);
        params.append('sort_order', filters.sortOrder);
        
        const token = localStorage.getItem('access_token');

        const response = await fetch(`/api/my-items?${params.toString()}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          throw new Error('Format data tidak sesuai');
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [tabType, filters]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiType = tabType === 'Donasi' ? 'donation' : 'rental';
        const token = localStorage.getItem('access_token');

        const response = await fetch(`/api/my-items?type=${apiType}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const sizes = [...new Set(result.data.map((item: Product) => item.size))] as string[];
          const colors = [...new Set(result.data.map((item: Product) => item.color))] as string[];
          setAvailableSizes(sizes);
          setAvailableColors(colors);
        }
      } catch (err) {
        console.error('Gagal fetch opsi size & color', err);
      }
    };
    fetchOptions();
  }, [tabType]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      sortOrder: 'desc',
      search: ''
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'out_of_stock': return 'Stok Habis';
      default: return '';
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="col-span-full"><Spinner /></div>;
    
    if (error) return (
      <div className="col-span-full flex flex-col items-center justify-center p-12">
        <div className="text-6xl mb-4">😵</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Terjadi kesalahan</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
    
    if (products.length === 0) return (
      <div className="col-span-full flex flex-col items-center justify-center p-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
        <p className="text-gray-600">Coba ubah filter pencarian atau tambahkan produk baru</p>
      </div>
    );
    
    return products.map(product => <ProductCard key={product.id} product={product} />);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '' && value !== 'desc').length;

  return (
    <div className="space-y-6">      
      {/* Search Bar dengan desain yang lebih modern */}
      <div className="relative">
        <input
          type="text"
          className="w-full pl-4 pr-4 py-4 text-gray-900 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
          placeholder={`🔍 Cari item berdasarkan nama...`}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        {filters.search && (
          <button
            onClick={() => handleFilterChange('search', '')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            showFilters || activeFiltersCount > 0
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          Filter
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        <button 
          onClick={clearFilters}
          className="px-4 py-2 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 font-medium"
        >
          Semua
        </button>

        <CustomDropdown
          options={[
            { label: 'Terbaru', value: 'desc' },
            { label: 'Terlama', value: 'asc' },
          ]}
          selectedValue={filters.sortOrder}
          className="w-36" 
          onSelect={(val) => handleFilterChange('sortOrder', val)}
        />

      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Filter Lanjutan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Status Filter */}
            <CustomDropdown
              label="Status"
              options={[
                { label: 'Semua Status', value: '' },
                { label: '✅ Aktif', value: 'active' },
                { label: '❌ Stok Habis', value: 'out_of_stock' },
              ]}
              selectedValue={filters.status}
              onSelect={(val) => handleFilterChange('status', val)}
            />

            {/* Size Filter */}
            <CustomDropdown
              label="Ukuran"
              options={[
                { label: 'Semua Ukuran', value: '' },
                ...availableSizes.map((size) => ({ label: size, value: size }))
              ]}
              selectedValue={filters.size}
              onSelect={(val) => handleFilterChange('size', val)}
            />


            {/* Color Filter */}
            <CustomDropdown
              label="Warna"
              options={[
                { label: 'Semua Warna', value: '' },
                ...availableColors
                  .filter((color): color is string => typeof color === 'string') // pastikan hanya string
                  .map((color) => ({
                    label: color.charAt(0).toUpperCase() + color.slice(1),
                    value: color,
                  }))
              ]}
              selectedValue={filters.color}
              onSelect={(val) => handleFilterChange('color', val)}
            />

            {/* Price Range (only for rental) */}
            {tabType === 'Sewa' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga Minimum</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={filters.minPrice}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, ''); // hapus semua yang bukan angka
                      handleFilterChange('minPrice', onlyNums);
                    }}
                    placeholder="0"
                    onKeyDown={(e) => {
                      // Hanya izinkan angka dan tombol navigasi (Backspace, Delete, Arrow keys, dll)
                      if (
                        ['e', 'E', '+', '-', '.', ',', ' '].includes(e.key) ||
                        (e.key.length === 1 && !/\d/.test(e.key))
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData('text');
                      if (!/^\d+$/.test(paste)) {
                        e.preventDefault(); // cegah jika yang dipaste bukan angka murni
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga Maksimum</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      handleFilterChange('maxPrice', onlyNums);
                    }}
                    placeholder="1000000"
                    onKeyDown={(e) => {
                      if (
                        ['e', 'E', '+', '-', '.', ',', ' '].includes(e.key) ||
                        (e.key.length === 1 && !/\d/.test(e.key))
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData('text');
                      if (!/^\d+$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-900">🏷️ Filter aktif:</span>
            {filters.status && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Status: {getStatusLabel(filters.status)}
              </span>
            )}
            {filters.size && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Ukuran: {filters.size}
              </span>
            )}
            {filters.color && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Warna: {filters.color}
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Harga: Rp{filters.minPrice || '0'} - Rp{filters.maxPrice || '∞'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {renderContent()}
      </div>
    </div>
  );
};

// --- Komponen Halaman Utama ---
export default function Page() {
  const [activeTab, setActiveTab] = React.useState<'Donasi' | 'Sewa'>('Donasi');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 md:gap-2 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Inventaris</h1>
          <p className="text-base md:text-lg text-gray-600">Kelola semua produk donasi dan rental Anda</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-4 w-full md:w-1/2 mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('Donasi')}
              className={`flex-1 px-6 py-3 font-semibold text-base rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'Donasi' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Donasi
            </button>
            <button
              onClick={() => setActiveTab('Sewa')}
              className={`flex-1 px-6 py-3 font-semibold text-base rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'Sewa' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sewa
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'Donasi' && <TabContent tabType="Donasi" />}
          {activeTab === 'Sewa' && <TabContent tabType="Sewa" />}
        </div>
      </div>
    </div>
  );
}
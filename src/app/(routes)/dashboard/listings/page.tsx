"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

// --- Tipe Data & Komponen ---

type Product = {
  id: string;
  name: string;
  type: 'donation' | 'rental';
  description: string;
  size: string;
  color: string;
  available_quantity: number;
  total_quantity: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  price?: number;
  category_id?: string;
};

type FilterState = {
  status: string;
  minPrice: string;
  maxPrice: string;
  size: string;
  color: string;
  sortOrder: 'desc' | 'asc';
  search: string;
};

type ProductCardProps = {
  product: Product;
};

// Komponen Spinner dengan animasi yang lebih smooth
const Spinner = () => (
  <div className="flex flex-col justify-center items-center w-full h-64">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
    </div>
    <p className="mt-4 text-gray-600 animate-pulse">Memuat produk...</p>
  </div>
);

// Komponen Kartu Produk dengan desain yang lebih modern
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : "/shirt.webp";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': 
        return { 
          color: 'bg-emerald-500', 
          text: 'Aktif', 
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          icon: '✓'
        };
      case 'inactive': 
        return { 
          color: 'bg-red-500', 
          text: 'Tidak Aktif', 
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: '⏸'
        };
      case 'out_of_stock': 
        return { 
          color: 'bg-gray-400', 
          text: 'Stok Habis', 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: '!'
        };
      default: 
        return { 
          color: 'bg-gray-400', 
          text: status, 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: '?'
        };
    }
  };

  const statusConfig = getStatusConfig(product.status);
  const stockPercentage = (product.available_quantity / product.total_quantity) * 100;

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 ${
        isHovered ? 'scale-[1.02]' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge untuk tipe produk */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          product.type === 'rental' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {product.type === 'rental' ? 'Sewa' : 'Donasi'}
        </span>
      </div>

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} flex items-center gap-1`}>
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.text}</span>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full"></div>
          </div>
        )}
        <Image 
          src={imageUrl} 
          alt={product.name} 
          width={300} 
          height={200} 
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Price & Details */}
        <div className="flex items-center gap-2 mb-3">
          {product.type === 'rental' && product.price && (
            <span className="text-xl font-bold text-green-600">
              Rp{product.price.toLocaleString('id-ID')}
            </span>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded-md">
              {product.size}
            </span>
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: product.color }}
              ></div>
              <span className="capitalize">{product.color}</span>
            </div>
          </div>
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Stok tersedia</span>
            <span className="text-sm font-semibold text-gray-900">
              {product.available_quantity} / {product.total_quantity}
            </span>
          </div>
          
          {/* Stock Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stockPercentage > 50 ? 'bg-green-500' : 
                stockPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stockPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button className="flex-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg transition-all duration-200 font-medium">
            📊 Aktivitas
          </button>
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
            ⚙️ Kelola
          </button>
        </div>
      </div>
    </div>
  );
}

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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
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
        
        const response = await fetch(`${baseUrl}/items?${params.toString()}`);
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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/items?type=${tabType === 'Donasi' ? 'donation' : 'rental'}`);
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
      case 'inactive': return 'Tidak Aktif';
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
      {/* Header Description */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <p className="text-gray-700 leading-relaxed">
          {tabType === 'Donasi' 
            ? '🎁 Kelola semua item donasi Anda dengan mudah. Pantau stok, status, dan aktivitas dalam satu tempat.'
            : '💰 Atur inventaris rental Anda dengan efisien. Lacak harga, ketersediaan, dan performa bisnis.'
          }
        </p>
      </div>
      
      {/* Search Bar dengan desain yang lebih modern */}
      <div className="relative">
        <input
          type="text"
          className="w-full pl-4 pr-4 py-4 text-gray-900 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
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
          🗑️ Reset
        </button>

        <select 
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          className="px-4 py-2 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 font-medium"
        >
          <option value="desc">📅 Terbaru</option>
          <option value="asc">📅 Terlama</option>
        </select>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Filter Lanjutan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="active">✅ Aktif</option>
                <option value="inactive">⏸️ Tidak Aktif</option>
                <option value="out_of_stock">❌ Stok Habis</option>
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran</label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Ukuran</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
              <select
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Warna</option>
                {availableColors.map((color) => (
                  <option key={color} value={color} className="capitalize">{color}</option>
                ))}
              </select>
            </div>

            {/* Price Range (only for rental) */}
            {tabType === 'Sewa' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga Minimum</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga Maksimum</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="1000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {renderContent()}
      </div>
    </div>
  );
};

// --- Komponen Halaman Utama ---
export default function Page() {
  const [activeTab, setActiveTab] = React.useState<'Donasi' | 'Sewa'>('Donasi');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Inventaris</h1>
          <p className="text-gray-600">Kelola semua produk donasi dan rental Anda</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('Donasi')}
              className={`flex-1 px-6 py-3 font-semibold text-base rounded-xl transition-all duration-300 ${
                activeTab === 'Donasi' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🎁 Donasi
            </button>
            <button
              onClick={() => setActiveTab('Sewa')}
              className={`flex-1 px-6 py-3 font-semibold text-base rounded-xl transition-all duration-300 ${
                activeTab === 'Sewa' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              💰 Sewa
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
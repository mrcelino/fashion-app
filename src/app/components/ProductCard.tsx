import React, { useState} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaCircleCheck } from 'react-icons/fa6';

export type Product = {
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

type ProductCardProps = {
  product: Product;
};
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : "/shirt.webp";

  // Mapping warna Indonesia ke CSS color
  const colorMap: Record<string, string> = {
    'Merah': 'red',
    'Biru': 'blue',
    'Hijau': 'green',
    'Kuning': 'yellow',
    'Hitam': 'black',
    'Putih': 'white',
    'Abu-abu': 'gray',
    'Coklat': 'brown',
    'Ungu': 'purple',
    'Pink': 'pink',
    'Oranye': 'orange',
    'Emas': 'gold',
    'Perak': 'silver',
    'Biru Muda': '#ADD8E6',
    'Biru Tua': '#00008B',
    'Hijau Muda': '#90EE90',
    'Hijau Tua': '#006400',
    'Krem': '#F5F5DC',
    'Marun': '#800000',
    'Navy': 'navy',
    'Toska': '#40E0D0',
    'Lavender': '#E6E6FA',
    'Cyan': 'cyan',
    'Magenta': 'magenta',
    'Silver': 'silver',
    'Beige': 'beige',
    'Coral': 'coral',
    'Lainnya': '#ccc',
  };

  const router = useRouter();

  const handleActivityClick = () => {
    const tab = product.type === 'rental' ? 'Sewa' : 'Donasi';
    
    const searchParams = new URLSearchParams({
      tab: tab,
      search: product.name
    });

    router.push(`/dashboard/activity?${searchParams.toString()}`);
  };

  const handleEditClick = () => {
    router.push(`/dashboard/edit-items/${product.id}`);
  };

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
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 max-w-sm ${
        isHovered ? 'scale-[1.02]' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
    {!(product.available_quantity === 0 && product.type === 'donation') && (
      <div className="absolute top-3 left-3 z-10">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.type === 'rental'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {product.type === 'rental' ? 'Sewa' : 'Donasi'}
        </span>
      </div>
    )}

    {/* Status Badge */}
    {!(product.available_quantity === 0 && product.type === 'donation') && (
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} flex items-center gap-1`}
        >
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.text}</span>
        </div>
      </div>
    )}

      {/* Special overlay for fully donated items */}
      {product.type === 'donation' && product.available_quantity === 0 && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white text-center py-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold">Dukunganmu Berarti ❤️</span>
          </div>
        </div>
      )}

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
          } group-hover:scale-110 ${
            product.type === 'donation' && product.available_quantity === 0 ? 'filter brightness-110 saturate-110' : ''
          }`}
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
          <div className="flex items-center justify-between gap-3 text-sm text-gray-600 w-full">
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: colorMap[product.color] || product.color }}
              ></div>
              <span className="capitalize">{product.color}</span>
            </div>
            <span className="bg-gray-100 px-2 py-1 rounded-md">
                {product.size}
            </span>
          </div>
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          {product.type === 'donation' && product.available_quantity === 0 ? (
            // Special design for fully donated items
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-2 relative overflow-hidden">              
              <div className="flex items-center justify-center gap-2">
                {/* Icon centang ijo apa dari FA*/}
                <FaCircleCheck className='text-emerald-700'/>
                <span className="text-sm font-semibold text-emerald-700">
                    100 % Terdistribusi
                </span>
              </div>
            </div>
          ) : (
            // Regular stock display
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Stok tersedia
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {product.available_quantity} / {product.total_quantity}
                </span>
              </div>
              
              {/* Stock Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    product.type === 'donation' 
                      ? stockPercentage > 50 ? 'bg-blue-500' : 
                        stockPercentage > 20 ? 'bg-orange-500' : 'bg-red-500'
                      : stockPercentage > 50 ? 'bg-green-500' : 
                        stockPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stockPercentage}%` }}
                ></div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button 
            onClick={handleActivityClick}
            className="flex-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg transition-all duration-200 font-medium cursor-pointer"
          >
            📊 Aktivitas
          </button>
          <button 
            onClick={handleEditClick}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg cursor-pointer"
          >
            ⚙️ Kelola
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { LatLng } from './types';

const MapClient = dynamic(() => import('./MapContainerClient'), { ssr: false });

// Default: Sleman / UGM
const DEFAULT_LOCATION = { lat: -7.7749, lng: 110.3740 };

type MapPickerProps = {
  initialLocation?: LatLng | null;
  onConfirm?: (location: LatLng) => void;
};

export default function MapPicker({ initialLocation, onConfirm }: MapPickerProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [tempLocation, setTempLocation] = useState<LatLng>(DEFAULT_LOCATION);

  const handleOpenMap = () => {
    setTempLocation(location || DEFAULT_LOCATION);
    setIsMapOpen(true);
  };

  const handleConfirm = () => {
    setLocation(tempLocation);
    onConfirm?.(tempLocation);
    setIsMapOpen(false);
  };

    useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  return (
    <>
      {/* Input Map */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Lokasi (Pin Point)</label>

        <div
          className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer group"
          onClick={handleOpenMap}
        >
          {location ? (
            <div className={`${isMapOpen ? 'invisible pointer-events-none' : ''} w-full h-full`}>
              <MapClient initialLocation={location} onSelect={() => {}} />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-center z-10">
              <h3 className="font-semibold text-gray-800">Pilih Lokasi Toko</h3>
              <p className="text-xs mt-1">Klik untuk menentukan lokasi</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition rounded-lg z-20 flex items-center justify-center">
            <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition">
              Ubah Lokasi
            </span>
          </div>
        </div>
      </div>

      {/* Modal Map */}
      {isMapOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-3xl shadow-lg">
            <div className="w-full h-[450px] rounded-xl mb-4 overflow-hidden relative z-50">
              <MapClient
                initialLocation={tempLocation}
                onSelect={(lat, lng) => setTempLocation({ lat, lng })}
              />
            </div>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setIsMapOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold w-52"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold w-52"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

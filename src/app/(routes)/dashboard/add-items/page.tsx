"use client";

import React, { useEffect, useRef, useState } from 'react';
import Toast from '../../../components/Toast';
import { InputField } from '@/app/components/InputField';
import { CustomDropdown } from '@/app/components/CustomDropdown';

// Tipe
type Category = {
  id: string;
  name: string;
};

const Page = () => {
  const [jenisBarang, setJenisBarang] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriList, setKategoriList] = useState<Category[]>([]);
  const [kondisi, setKondisi] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [jumlah, setJumlah] = useState<number>(1);
  const [harga, setHarga] = useState<number>(0);
  const [deskripsi, setDeskripsi] = useState('');
  const [images, setImages] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const result = await res.json();
        if (result.success) {
          setKategoriList(result.data);
        }
      } catch (err) {
        console.error('Gagal fetch kategori', err);
      }
    };
    fetchCategories();
  }, []);

  // POST handler
  const handleSubmit = async () => {
  setErrorMessage(''); // reset error

  if (!jenisBarang) return setErrorMessage('Jenis barang wajib dipilih.');
  if (!nama.trim()) return setErrorMessage('Nama barang wajib diisi.');
  if (!kategori) return setErrorMessage('Kategori wajib dipilih.');
  if (!kondisi) return setErrorMessage('Kondisi wajib dipilih.');
  if (!size.trim()) return setErrorMessage('Ukuran (size) wajib diisi.');
  if (!color.trim()) return setErrorMessage('Warna wajib diisi.');
  if (!jumlah || jumlah <= 0) return setErrorMessage('Jumlah harus lebih dari 0.');
  if (jenisBarang === 'Sewa' && (!harga || harga <= 0)) return setErrorMessage('Harga sewa wajib diisi dan lebih dari 0.');
  if (!images) return setErrorMessage('Gambar barang wajib diunggah.');
  if (!deskripsi.trim()) return setErrorMessage('Deskripsi wajib diisi.');
    const formData = new FormData();
    const token = localStorage.getItem('access_token');

    const selectedKategori = kategoriList.find((cat) => cat.name === kategori);

    formData.append('type', jenisBarang === 'Sewa' ? 'rental' : 'donation');
    formData.append('name', nama);
    formData.append('category_id', selectedKategori?.id || '');
    formData.append('condition', kondisi);
    formData.append('size', size);
    formData.append('color', color);
    formData.append('total_quantity', jumlah.toString());
    if (images) formData.append('images', images);
    formData.append('description', deskripsi);
    if (jenisBarang === 'Sewa') formData.append('price', harga.toString());

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setToast({ message: 'Item berhasil disimpan!', type: 'success' });
        setTimeout(() => {
          window.location.href = '/dashboard/listings';
        }, 2000);
      } else {
        setToast({ message: result.message || 'Gagal menyimpan item.', type: 'error' });
      }
    } catch (err) {
      console.error('Gagal mengirim data', err);
      setToast({ message: 'Terjadi kesalahan saat mengirim data.', type: 'error' });
    }
  };

  const kondisiOptions = [
  { label: 'Sangat Baik', value: 'excellent' },
  { label: 'Baik', value: 'good' },
  { label: 'Cukup', value: 'fair' },
  ];

  const sizeOptions = [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
  ];

  return (
    
    <div className="flex flex-col justify-center gap-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className='flex flex-row justify-between'>
        <h2 className="text-2xl font-bold text-gray-800">Tambah item</h2>
        {errorMessage && (
          <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Kolom Kiri */}
        <div className="flex flex-col gap-y-5 mb-10">
          <CustomDropdown
            label="Jenis Barang (Sewa / Donasi)"
            placeholder="Pilih Jenis"
            options={['Sewa', 'Donasi']}
            selectedValue={jenisBarang}
            onSelect={setJenisBarang}
          />
          <InputField label="Nama Pakaian" placeholder="Nama Barang" value={nama} onChange={(e) => setNama(e.target.value)} />
          <CustomDropdown
            label="Kategori"
            placeholder="Pilih Kategori"
            options={kategoriList.map((k) => k.name)}
            selectedValue={kategori}
            onSelect={setKategori}
          />
          {jenisBarang === 'Sewa' && (
            <InputField 
              label="Harga Sewa / Hari"
              placeholder="Harga Sewa"
              type="text"
              value={harga === 0 ? '' : harga.toLocaleString('id-ID')}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                setHarga(raw ? parseInt(raw, 10) : 0);
              }}
            />
          )}
          <CustomDropdown
            label="Kondisi"
            placeholder="Pilih Kondisi"
            options={kondisiOptions.map((o) => o.label)}
            selectedValue={kondisiOptions.find(o => o.value === kondisi)?.label || ''}
            onSelect={(label) => {
              const selected = kondisiOptions.find(o => o.label === label);
              if (selected) setKondisi(selected.value);
            }}
          />
          <CustomDropdown label="Size" placeholder="Pilih Size" options={sizeOptions.map((o) => ({ label: o.label, value: o.value }))} selectedValue={size} onSelect={setSize} />
          <InputField label="Warna" placeholder="Warna" value={color} onChange={(e) => { const value = e.target.value; setColor(value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()); }} />
          <InputField label="Jumlah" placeholder="Jumlah" type="number" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} />
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Foto Barang</label>
          <div
            className={`flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer hover:border-blue-400 transition overflow-hidden ${
              imagePreview ? 'h-64' : 'h-48'
            }`}
            onClick={() => document.getElementById('uploadInput')?.click()}
          >
            <input
              id="uploadInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImages(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setImagePreview(null);
                }
              }}
              className="hidden"
            />

            {!imagePreview ? (
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold text-gray-800">Unggah Foto Barang</h3>
                <p className="text-xs text-gray-500 mt-1">Seret dan lepas atau klik di sini</p>
                <div className="text-sm font-medium bg-gray-100 border border-gray-300 px-4 py-1.5 rounded-lg mt-4 hover:bg-gray-200 transition">
                  Pilih File
                </div>
              </div>
            ) : (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain rounded"
              />
            )}
          </div>
        </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-24 resize-none outline-0"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition">
              Kosongkan Formulir
            </button>
            <button onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition">
              Simpan Barang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

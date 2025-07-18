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
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [imagePreview1, setImagePreview1] = useState<string>('');
  const [imagePreview2, setImagePreview2] = useState<string>('');
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

  // Image handlers
  const handleImage1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage1(file);
      setImagePreview1(URL.createObjectURL(file));
    }
  };

  const handleImage2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage2(file);
      setImagePreview2(URL.createObjectURL(file));
    }
  };

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
  if (!image1) return setErrorMessage('Gambar 1 wajib diunggah.');
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
    if (image1) formData.append('images', image1);
    if (image2) formData.append('images', image2);
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
            <div className="grid grid-cols-2 gap-4">
              {/* Image 1 Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600">Gambar 1 *</label>
                <div
                  className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer hover:border-blue-400 transition overflow-hidden"
                  onClick={() => document.getElementById('fileInput1')?.click()}
                >
                  <input type="file" accept="image/*" onChange={handleImage1Change} className="hidden" id="fileInput1" />
                  {imagePreview1 ? (
                    <img src={imagePreview1} alt="Preview 1" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <h3 className="font-semibold text-gray-800 text-sm">Upload Gambar 1</h3>
                      <p className="text-xs text-gray-500 mt-1">Klik untuk pilih</p>
                      <div className="text-xs font-medium bg-gray-100 border border-gray-300 px-3 py-1 rounded-lg mt-2 hover:bg-gray-200 transition">
                        Pilih File
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image 2 Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600">Gambar 2</label>
                <div
                  className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer hover:border-blue-400 transition overflow-hidden"
                  onClick={() => document.getElementById('fileInput2')?.click()}
                >
                  <input type="file" accept="image/*" onChange={handleImage2Change} className="hidden" id="fileInput2" />
                  {imagePreview2 ? (
                    <img src={imagePreview2} alt="Preview 2" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <h3 className="font-semibold text-gray-800 text-sm">Upload Gambar 2</h3>
                      <p className="text-xs text-gray-500 mt-1">Klik untuk pilih</p>
                      <div className="text-xs font-medium bg-gray-100 border border-gray-300 px-3 py-1 rounded-lg mt-2 hover:bg-gray-200 transition">
                        Pilih File
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

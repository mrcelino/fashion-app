"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InputField } from '@/app/components/InputField';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { Spinner } from '@/app/components/Spinner';
import Toast from '@/app/components/Toast';

type Category = {
  id: string;
  name: string;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/categories', {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        const result = await response.json();
        if (result.success) setKategoriList(result.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch item data
  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) {
        router.push('/dashboard/listings');
        return;
      }
      
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/api/items/${id}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        const result = await response.json();
        console.log('Fetched item data:', result);
        
        if (result.success && result.data) {
          const item = result.data;
          setJenisBarang(item.type === 'rental' ? 'Sewa' : 'Donasi');
          setNama(item.name);
          setKategori(item.category_id);
          setKondisi(item.condition);
          setSize(item.size);
          setColor(item.color);
          setJumlah(item.total_quantity);
          setHarga(item.price || 0);
          setDeskripsi(item.description);
          setExistingImages(item.images || []);
          setImagePreview(item.images || []);
        } else {
          // Item not found or invalid response
          showToast('Item tidak ditemukan', 'error');
          setTimeout(() => router.push('/dashboard/listings'), 1500);
        }
      } catch (err) {
        console.error('Failed to fetch item:', err);
        showToast('Gagal memuat item', 'error');
        setTimeout(() => router.push('/dashboard/listings'), 1500);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItemData();
  }, [id, router]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(files);
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreview(previewUrls); // Replace old images with new ones
    }
  };

  const handleSubmit = async () => {
    if (!nama.trim() || !kategori || !kondisi || !size || !color || jumlah <= 0) {
      showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }
    if (jenisBarang === 'Sewa' && harga <= 0) {
      showToast('Harga sewa harus lebih dari 0', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', nama.trim());
      formData.append('category_id', kategori);
      formData.append('type', jenisBarang === 'Sewa' ? 'rental' : 'donation');
      formData.append('condition', kondisi);
      formData.append('size', size.trim());
      formData.append('color', color.trim());
      formData.append('total_quantity', jumlah.toString());
      formData.append('description', deskripsi.trim());
      if (jenisBarang === 'Sewa') formData.append('price', harga.toString());
      images.forEach((image) => formData.append('images', image));

      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        showToast('Item berhasil diupdate!', 'success');
        setTimeout(() => router.push('/dashboard/listings'), 1500);
      } else {
        throw new Error(result.message || 'Gagal mengupdate item');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat mengupdate item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        setShowDeleteModal(false);
        showToast('Item berhasil dihapus!', 'success');
        setTimeout(() => router.push('/dashboard/listings'), 1500);
      }
    } catch (err) {
      showToast('Gagal menghapus item', 'error');
    }
  };

  const clearForm = () => {
    setJenisBarang('');
    setNama('');
    setKategori('');
    setKondisi('');
    setSize('');
    setColor('');
    setJumlah(1);
    setHarga(0);
    setDeskripsi('');
    setImages([]);
    setImagePreview(existingImages);
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[400px]"><Spinner /></div>;

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
        <h2 className="text-2xl font-bold text-gray-800">Kelola Item</h2>
        <button onClick={() => setShowDeleteModal(true)} className='btn rounded-2xl bg-red-500 text-white cursor-pointer hover:scale-105 transition duration-300 px-4 py-2'>
          Hapus Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Left Column */}
        <div className="flex flex-col gap-y-5 mb-10">
          <CustomDropdown label="Jenis Barang (Sewa / Donasi)" placeholder="Pilih Jenis" options={['Sewa', 'Donasi']} selectedValue={jenisBarang} onSelect={setJenisBarang} disabled/>
          <InputField label="Nama Pakaian" placeholder="Nama Barang" value={nama} onChange={(e) => setNama(e.target.value)} />
          <CustomDropdown label="Kategori" placeholder="Pilih Kategori" options={kategoriList.map(cat => ({ label: cat.name, value: cat.id }))} selectedValue={kategori} onSelect={setKategori} />
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
            options={kondisiOptions} 
            selectedValue={kondisi} 
            onSelect={setKondisi} 
          />
          <CustomDropdown label="Size" placeholder="Pilih Size" options={sizeOptions.map((o) => ({ label: o.label, value: o.value }))} selectedValue={size} onSelect={setSize} />
          <InputField label="Warna" placeholder="Warna" value={color} onChange={(e) => { const value = e.target.value; setColor(value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()); }} />
          <InputField label="Jumlah tersedia" placeholder="Jumlah tersedia" type="number" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} />


        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Foto Barang</label>
            <div
              className={`flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer hover:border-blue-400 transition overflow-hidden ${
                imagePreview.length > 0 ? 'h-64' : 'h-48'
              }`}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="fileInput" />

              {imagePreview.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <h3 className="font-semibold text-gray-800">Unggah Foto Barang</h3>
                  <p className="text-xs text-gray-500 mt-1">Seret dan lepas atau klik di sini</p>
                  <div className="text-sm font-medium bg-gray-100 border border-gray-300 px-4 py-1.5 rounded-lg mt-4 hover:bg-gray-200 transition">
                    Pilih File
                  </div>
                </div>
              ) : imagePreview.length === 1 ? (
                <img src={imagePreview[0]} alt="Preview" className="w-full h-full object-contain rounded" />
              ) : (
                <div className="grid grid-cols-2 gap-2 w-full h-full">
                  {imagePreview.map((url, index) => (
                    <img key={index} src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea placeholder="Deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="w-full h-fit border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-24 resize-none outline-0" />
          </div>
          
          <div className="flex justify-end gap-4">
            <button type="button" onClick={clearForm} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition cursor-pointer">
              Reset Form
            </button>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition cursor-pointer disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : 'Update Barang'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-center">Konfirmasi Hapus Item</h3>
            <p className="pt-4 text-center">Apakah Anda yakin ingin menghapus item ini?</p>
            <p className='text-center'>Tindakan ini tidak dapat dibatalkan.</p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
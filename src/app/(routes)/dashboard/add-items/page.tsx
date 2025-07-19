"use client";

import React, { useEffect, useRef, useState } from 'react';
import Toast from '../../../components/Toast';
import { InputField } from '@/app/components/InputField';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { FaCheckCircle } from 'react-icons/fa';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiAnalysisFailed, setAiAnalysisFailed] = useState(false);

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
  // AI Analysis function
  const analyzeWithAI = async (imageFile: File) => {
    setIsAnalyzing(true);
    setAiAnalysisFailed(false);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/ai/analyze-clothing', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.data);
        setAiAnalysisFailed(false);
        setToast({ message: 'AI berhasil menganalisis gambar! Klik "Terapkan Saran AI" untuk menggunakan hasil analisis.', type: 'success' });
      } else {
        setAiAnalysisFailed(true);
        // Check for specific error types
        if (result.error?.includes('overloaded') || result.error?.includes('503')) {
          setToast({ 
            message: 'Server AI sedang sibuk. Silakan coba lagi dalam beberapa menit atau isi form secara manual.', 
            type: 'error' 
          });
        } else if (result.error?.includes('429')) {
          setToast({ 
            message: 'Terlalu banyak permintaan. Silakan tunggu sebentar dan coba lagi.', 
            type: 'error' 
          });
        } else {
          setToast({ 
            message: result.message || 'Gagal menganalisis gambar dengan AI. Silakan isi form secara manual.', 
            type: 'error' 
          });
        }
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiAnalysisFailed(true);
      setToast({ 
        message: 'Koneksi ke server AI bermasalah. Silakan periksa koneksi internet dan coba lagi.', 
        type: 'error' 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Retry AI analysis
  const retryAIAnalysis = () => {
    if (image1) {
      analyzeWithAI(image1);
    }
  };

  // Apply AI suggestions to form
  const applyAISuggestions = () => {
    if (!aiSuggestions) return;

    setNama(aiSuggestions.name || '');
    setDeskripsi(aiSuggestions.description || '');
    setColor(aiSuggestions.color || '');
    setSize(aiSuggestions.size || '');
    
    // Map AI category to our category list
    const matchingCategory = kategoriList.find(cat => 
      cat.name.toLowerCase().includes(aiSuggestions.category.toLowerCase()) ||
      aiSuggestions.category.toLowerCase().includes(cat.name.toLowerCase())
    );
    if (matchingCategory) {
      setKategori(matchingCategory.name);
    }

    // Map AI condition to our condition options
    setKondisi(aiSuggestions.condition || '');

    setToast({ message: 'Saran AI telah diterapkan! Silakan review dan sesuaikan jika diperlukan.', type: 'success' });
  };

  const handleImage1Change = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage1(file);
      setImagePreview1(URL.createObjectURL(file));
      
      // Trigger AI analysis for the first image
      if (file.type.startsWith('image/')) {
        await analyzeWithAI(file);
      }
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

  // Function to format AI condition to user-friendly text
  const formatAICondition = (condition: string) => {
    const conditionMap: { [key: string]: string } = {
      'excellent': 'Sangat Baik',
      'good': 'Baik', 
      'fair': 'Cukup'
    };
    
    // Check if condition is already in Indonesian
    if (Object.values(conditionMap).includes(condition)) {
      return condition;
    }
    
    // Convert English to Indonesian
    return conditionMap[condition.toLowerCase()] || condition;
  };

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
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tambah item</h2>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-blue-600">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="text-sm font-medium">AI sedang menganalisis gambar...</span>
            </div>
          )}
        </div>
        {errorMessage && (
          <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>

      {/* AI Smart Listing Banner */}
      {!aiSuggestions && !isAnalyzing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">🤖 AI Smart Listing Assistant</h3>
              <p className="text-xs text-blue-700 mt-1">
                Upload gambar pertama untuk mengaktifkan analisis AI otomatis. AI akan mengisi nama, kategori, deskripsi, dan detail lainnya secara otomatis!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Panel */}
      {aiSuggestions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 text-center">✨ AI Analysis Complete!</h3>
                <div className="text-xs text-green-700 mt-2 space-y-1">
                  <p><strong>Nama:</strong> {aiSuggestions.name}</p>
                  <p><strong>Kategori:</strong> {aiSuggestions.category}</p>
                  <p><strong>Warna:</strong> {aiSuggestions.color}</p>
                  <p><strong>Ukuran:</strong> {aiSuggestions.size}</p>
                  <p><strong>Kondisi:</strong> {formatAICondition(aiSuggestions.condition)}</p>
                  <p><strong>Material:</strong> {aiSuggestions.material}</p>
                  <p><strong>Deskripsi:</strong> {aiSuggestions.description}</p>
                </div>
              </div>
            </div>
            <div className='flex justify-end w-full'>
              <button
                onClick={applyAISuggestions}
                className="px-2 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition cursor-pointer"
              >
                Terapkan Saran AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Failed - Retry Panel */}
      {aiAnalysisFailed && !aiSuggestions && !isAnalyzing && imagePreview1 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-900">⚠️ AI Analysis Failed</h3>
                <p className="text-xs text-orange-700 mt-1">
                  Analisis AI gagal. Anda bisa mencoba lagi atau mengisi form secara manual.
                </p>
              </div>
            </div>
            <button
              onClick={retryAIAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {isAnalyzing ? 'Mencoba...' : 'Coba Lagi'}
            </button>
          </div>
        </div>
      )}

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
                <label className="text-xs font-medium text-gray-600">
                  Gambar 1 * 
                  <span className="ml-1 text-blue-600 font-semibold">🤖 AI</span>
                </label>
                <div
                  className="flex items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center relative cursor-pointer hover:border-blue-400 transition overflow-hidden bg-blue-50"
                  onClick={() => document.getElementById('fileInput1')?.click()}
                >
                  <input type="file" accept="image/*" onChange={handleImage1Change} className="hidden" id="fileInput1" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="loading loading-spinner loading-md text-blue-600"></span>
                        <span className="text-xs font-medium text-blue-700">AI menganalisis...</span>
                      </div>
                    </div>
                  )}
                  {imagePreview1 ? (
                    <img src={imagePreview1} alt="Preview 1" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <h3 className="font-semibold text-blue-800 text-sm">Upload Gambar 1</h3>
                      <p className="text-xs text-blue-600 mt-1">AI akan menganalisis otomatis</p>
                      <div className="text-xs font-medium bg-blue-100 border border-blue-300 px-3 py-1 rounded-lg mt-2 hover:bg-blue-200 transition">
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

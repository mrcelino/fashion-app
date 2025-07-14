"use client";

import { useEffect, useState, FC } from "react";
import MapPicker from "../../../components/MapPicker/MapPicker";
import { useAuth } from "../../../context/AuthContext"

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
};

const InputField: FC<InputFieldProps> = ({ label, placeholder, type = 'text', value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-0"
    />
  </div>
);

const Page: FC = () => {
  const { user, setUser } = useAuth();
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kota, setKota] = useState("");
  const [kontak, setKontak] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [latLng, setLatLng] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (user) {
      setNama(user.full_name || "");
      setAlamat(user.address || "");
      setKota(user.city || "");
      setKontak(user.phone || "");
      setDeskripsi(user.description || "");

      if (user.latitude && user.longitude) {
        setLatLng({ latitude: user.latitude, longitude: user.longitude });
      }
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Token tidak ditemukan, silakan login ulang');
        return;
      }

      const formData = new FormData();
      formData.append('full_name', nama);
      formData.append('address', alamat);
      formData.append('city', kota);
      formData.append('phone', kontak);
      formData.append('description', deskripsi);
      if (latLng) {
        formData.append('latitude', latLng.latitude.toString());
        formData.append('longitude', latLng.longitude.toString());
      }

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const response = await res.json();

      if (!res.ok) {
        console.error('Response error:', response);
        throw new Error(response.message || 'Gagal memperbarui profil');
      }

      const userData = response.data;

      setUser(userData);

      setNama(userData.full_name || "");
      setAlamat(userData.address || "");
      setKota(userData.city || "");
      setKontak(userData.phone || "");
      setDeskripsi(userData.description || "");

      if (userData.latitude && userData.longitude) {
        setLatLng({ latitude: userData.latitude, longitude: userData.longitude });
      }

      alert('Profil berhasil diperbarui!');
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('Terjadi kesalahan saat menyimpan: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <h2 className="text-2xl font-bold text-gray-800">Pengaturan</h2>
      <h2 className="text-lg font-semibold text-gray-800">🏬 Profil Bisnis / Komunitas / Pribadi</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="flex flex-col gap-y-5">
          <InputField label="Nama" placeholder="Nama" value={nama} onChange={setNama} />
          <InputField label="Alamat Lengkap" placeholder="Alamat" value={alamat} onChange={setAlamat} />
          <InputField label="Kota / Kabupaten" placeholder="Kota / Kabupaten" value={kota} onChange={setKota} />
          <InputField label="Kontak" placeholder="Kontak" type="number" value={kontak} onChange={setKontak} />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              placeholder="Deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full h-fit border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-24 resize-none outline-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-2">
            <MapPicker
              initialLocation={
                latLng ? { lat: latLng.latitude, lng: latLng.longitude } : undefined
              }
              onConfirm={(loc) => setLatLng({ latitude: loc.lat, longitude: loc.lng })}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              onClick={() => {
                setNama(""); setAlamat(""); setKota(""); setKontak(""); setDeskripsi("");
              }}
            >
              Kosongkan Formulir
            </button>
            <button
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition cursor-pointer"
              onClick={handleSubmit}
            >
              Simpan Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

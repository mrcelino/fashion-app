import React from "react";

export default function page() {
  return (
    <>
      <div className="flex flex-col justify-center gap-4">
        <h2 className="font-semibold text-2xl">Beranda</h2>
        <h2 className="font-medium text-base">Hai, Marcelino!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 border-gray-200 border-2 rounded-xl p-6 min-h-40">
            <h2 className="text-lg font-semibold">Barang Aktif</h2>
            <h2 className="text-sm">
              Pakaian yang sedang tersedia untuk donasi atau sewa.
            </h2>
            <h2 className="text-3xl font-semibold">25</h2>
          </div>
          <div className="flex flex-col gap-2 border-gray-200 border-2 rounded-xl p-6 min-h-40">
            <h2 className="text-lg font-semibold">Permintaan Masuk</h2>
            <h2 className="text-sm">
              Daftar permintaan donasi atau sewa yang menunggu persetujuan kamu.
            </h2>
            <h2 className="text-3xl font-semibold">10</h2>
          </div>
          <div className="flex flex-col gap-2 border-gray-200 border-2 rounded-xl p-6 min-h-40">
            <h2 className="text-lg font-semibold">Barang Terdistribusi</h2>
            <h2 className="text-sm">
              Jumlah pakaian yang sudah berhasil didonasikan.
            </h2>
            <h2 className="text-3xl font-semibold">25</h2>
          </div>
        </div>
        <h2 className="font-semibold text-xl">Latest Request</h2>
        <div className="overflow-auto rounded-xl border-2 border-gray-200">
          <table className="w-full table-auto text-left">
              <thead className="">
                  <tr>
                      <th className="p-3 font-semibold">Nama Item</th>
                      <th className="p-3 font-semibold">Pemohon</th>
                      <th className="p-3 font-semibold">Kategori</th>
                      <th className="p-3 font-semibold">Tanggal</th>
                      <th className="p-3 font-semibold">Status</th> 
                      <th className="p-3 font-semibold">Aksi</th>
                  </tr>
              </thead>
              <tbody>
                  <tr className="border-gray-200 border-t-2">
                      <td className="p-3">Black Blazer (M)</td>
                      <td className="p-3">Marcelino</td>
                      <td className="p-3">Sewa</td>
                      <td className="p-3">26 Juli 2025</td>
                      <td className="p-3 bg-transparent">
                        <span className="bg-gray-200 rounded-2xl px-3 py-1 inline-block">
                          Pending
                        </span>
                      </td>
                      <td className="p-3 font-semibold cursor-pointer">👁️ View</td>
                  </tr>
              </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

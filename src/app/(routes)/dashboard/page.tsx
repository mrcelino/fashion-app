"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/api/users/dashboard", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
        const result = await res.json();
        if (result.success && result.data) {
          setStats(result.data.stats);
          setRecentRequests(result.data.recent_requests || []);
          setRecentItems(result.data.recent_items || []);
        }
      } catch (e) {
        // Handle error if needed
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function statusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Helper: get item name by id
  function getItemName(item_id: string) {
    const found = recentItems.find((item) => item.id === item_id);
    return found ? found.name : "-";
  }

  return (
    <>
      <div className="flex flex-col justify-center gap-8 max-w-7xl mx-auto">
        {/* Title & Greeting */}
        <div className="space-y-2">
          <h2 className="font-bold text-2xl text-gray-900">Beranda</h2>
          <h3 className="font-medium text-lg text-gray-600">
            Halo, Marcelino! Yuk lihat update terbaru
          </h3>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 min-h-[160px] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Barang Aktif
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Pakaian yang sedang tersedia untuk donasi atau sewa.
              </p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-auto">
              {stats ? stats.active_items : "-"}
            </h3>
          </div>

          <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-6 shadow-sm bg-gradient-to-br from-green-50 to-green-100 min-h-[160px] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Permintaan Masuk
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Daftar permintaan donasi atau sewa yang menunggu persetujuan
                kamu.
              </p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-auto">
              {stats ? stats.pending_requests : "-"}
            </h3>
          </div>

          <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-6 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 min-h-[160px] hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Barang Terdistribusi
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Jumlah pakaian yang sudah berhasil didonasikan.
              </p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-auto">
              {stats ? stats.completed_requests : "-"}
            </h3>
          </div>
        </div>

        {/* Latest Request Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl text-gray-900">
              Aktivitas terkini
            </h2>
            <Link
              href="/dashboard/activity"
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white mb-5">
            <table className="w-full table-auto text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Nama Item</th>
                  <th className="p-4 font-semibold text-gray-700">Pemohon</th>
                  <th className="p-4 font-semibold text-gray-700">Kategori</th>
                  <th className="p-4 font-semibold text-gray-700">Tanggal</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Tidak ada aktivitas terkini.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900">
                            {req.item_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">
                              {req.user_full_name?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <span className="text-gray-900">
                            {req.user_full_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            req.type === "rental"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {req.type === "rental" ? "Sewa" : "Donasi"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                            req.status
                          )}`}
                        >
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/dashboard/activity?tab=${
                            req.type === "rental" ? "Sewa" : "Donasi"
                          }&search=${encodeURIComponent(
                            getItemName(req.item_id)
                          )}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

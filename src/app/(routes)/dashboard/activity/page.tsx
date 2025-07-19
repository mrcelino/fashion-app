"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import DetailModal from "../../../components/DetailModal";
import { formatDate } from "../../../components/DetailModal";

type RequestData = {
  id: string;
  item_id: string;
  user_id: string;
  partner_id: string;
  type: "donation" | "rental";
  quantity: number;
  reason: string;
  contact_info: string;
  pickup_date?: string;
  return_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  item_name: string;
  item_price?: number;
  item_images?: string[];
  category_name: string;
  user_name: string;
  user_full_name: string;
  user_phone: string;
  user_photo: string | null;
};

type FilterState = {
  search: string;
};

const statusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const TabContent = ({ tabType, defaultSearch = "", searchFromUrl = "" }: { tabType: "Donasi" | "Sewa"; defaultSearch?: string; searchFromUrl?: string }) => {
  const [filters, setFilters] = useState<FilterState>({ search: defaultSearch });
  const [data, setData] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<RequestData | null>(null);

  // Update search filter when URL search parameter changes
  useEffect(() => {
    if (searchFromUrl !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchFromUrl }));
    }
  }, [searchFromUrl]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const type = tabType === "Donasi" ? "donation" : "rental";
      const params = new URLSearchParams();
      params.append("type", type);
      if (filters.search) params.append("search", filters.search);

      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/requests/partner?${params.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        throw new Error("Format data tidak sesuai");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabType, filters]);

  const handleSuccess = () => {
    fetchData();
  };
  
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Filter data di frontend
  const filteredData = data.filter(
    (item) =>
      item.item_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.user_full_name.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          className="w-full pl-4 pr-4 py-4 text-gray-900 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
          placeholder={`🔍 Cari item atau nama pemohon...`}
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        {filters.search && (
          <button
            onClick={() => handleFilterChange("search", "")}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
        <table className="w-full table-auto text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Nama Item</th>
              <th className="p-4 font-semibold text-gray-700">
                {tabType === "Sewa" ? "Penyewa" : "Pemohon"}
              </th>
              {tabType === "Sewa" ? (
                <>
                  <th className="p-4 font-semibold text-gray-700">
                    Tanggal Mulai
                  </th>
                  <th className="p-4 font-semibold text-gray-700">
                    Tanggal Selesai
                  </th>
                </>
              ) : (
                <>
                  <th className="p-4 font-semibold text-gray-700">Tujuan</th>
                  <th className="p-4 font-semibold text-gray-700">Tanggal</th>
                </>
              )}
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                      <span>Memuat Detail...</span>
                    </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Nama Item */}
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image
                          src={item.item_images?.[0] || "/placeholder.png"}
                          alt={item.item_name}
                          width={40}
                          height={40}
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.item_name}
                      </span>
                    </div>
                  </td>
                  {/* Pemohon/Penyewa */}
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tabType === "Sewa" ? "bg-blue-100" : "bg-green-100"
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold ${
                            tabType === "Sewa"
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.user_full_name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="text-gray-900">
                        {item.user_full_name}
                      </span>
                    </div>
                  </td>
                  {/* Tanggal/Tujuan */}
                  {tabType === "Sewa" ? (
                    <>
                      <td className="p-4 text-gray-600">
                        {formatDate(item.pickup_date)}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatDate(item.return_date)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-gray-600">
                        {item.reason || "-"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatDate(item.created_at)}
                      </td>
                    </>
                  )}
                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                        item.status
                      )}`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </td>
                  {/* Aksi */}
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setModalOpen(true);
                        setSelectedRequestData(item);
                      }} 
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
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequestData(null);
        }}
        requestData={selectedRequestData}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default function Page() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") === "Sewa" ? "Sewa" : "Donasi";
  const currentSearch = searchParams.get("search") || "";

  const [activeTab, setActiveTab] = useState<"Donasi" | "Sewa">(currentTab);

  // Listen for URL parameter changes and update activeTab
  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 md:gap-2 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Aktivitas</h1>
          <p className="text-base md:text-lg text-gray-600">
            Pantau aktivitas terkait donasi dan sewa Anda
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-4 w-full md:w-1/2 mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("Donasi")}
              className={`flex-1 px-6 py-3 font-semibold text-base rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "Donasi"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Donasi
            </button>
            <button
              onClick={() => setActiveTab("Sewa")}
              className={`flex-1 px-6 py-3 font-semibold text-base rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "Sewa"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sewa
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "Donasi" && <TabContent tabType="Donasi" searchFromUrl={currentTab === "Donasi" ? currentSearch : ""} />}
          {activeTab === "Sewa" && <TabContent tabType="Sewa" searchFromUrl={currentTab === "Sewa" ? currentSearch : ""} />}
        </div>
               
      </div>
    </div>
  );
}
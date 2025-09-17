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

type OrderData = {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  type: "thrifting";
  status: "awaiting_payment" | "paid" | "cancelled";
  item_price: number;
  shipping_fee: number;
  total_amount: number;
  shipping_method: string;
  distance_km: number;
  weight_kg: number;
  notes: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  request_id?: string | null;
};

type ItemDetail = {
  id: string;
  partner_id: string;
  category_id: string;
  name: string;
  description: string;
  size: string;
  color: string;
  type: string;
  price: number;
  total_quantity: number;
  available_quantity: number;
  condition: string;
  images: string[];
};

type FilterState = {
  search: string;
};

const getShippingMethodLabel = (method: string) => {
  const shippingMap: { [key: string]: string } = {
    pickup_warehouse: "Ambil di Gudang",
    direct_cod: "COD - Bayar di Tempat",
    app_agent: "Agen Aplikasi",
  };
  return shippingMap[method] || method;
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
    case "awaiting_payment":
      return "bg-orange-100 text-orange-800";
    case "paid":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const TabContent = ({
  tabType,
  defaultSearch = "",
  searchFromUrl = "",
}: {
  tabType: "Donasi" | "Sewa" | "Thrifting";
  defaultSearch?: string;
  searchFromUrl?: string;
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: defaultSearch,
  });
  const [data, setData] = useState<RequestData[] | OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] =
    useState<RequestData | null>(null);
  const [selectedOrderData, setSelectedOrderData] = useState<OrderData | null>(
    null
  );
  const [itemDetails, setItemDetails] = useState<{ [key: string]: ItemDetail }>(
    {}
  );

  // Update search filter when URL search parameter changes
  useEffect(() => {
    if (searchFromUrl !== filters.search) {
      setFilters((prev) => ({ ...prev, search: searchFromUrl }));
    }
  }, [searchFromUrl]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      let res;

      if (tabType === "Thrifting") {
        // Fetch orders for thrifting from /api/orders/partner
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);

        res = await fetch(`/api/orders/partner?${params.toString()}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
      } else {
        // Fetch requests for donation/rental
        const type = tabType === "Donasi" ? "donation" : "rental";
        const params = new URLSearchParams();
        params.append("type", type);
        if (filters.search) params.append("search", filters.search);

        res = await fetch(`/api/requests/partner?${params.toString()}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
      }

      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);

        // For thrifting, fetch item details for each order
        if (tabType === "Thrifting") {
          const orders = result.data as OrderData[];
          const itemDetailsPromises = orders.map((order) =>
            fetchItemDetail(order.item_id)
          );
          const itemDetailsResults = await Promise.all(itemDetailsPromises);

          const itemDetailsMap: { [key: string]: ItemDetail } = {};
          itemDetailsResults.forEach((detail, index) => {
            if (detail) {
              itemDetailsMap[orders[index].item_id] = detail;
            }
          });
          setItemDetails(itemDetailsMap);
        }
      } else {
        throw new Error("Format data tidak sesuai");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemDetail = async (
    itemId: string
  ): Promise<ItemDetail | null> => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/items/${itemId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return null;
      const result = await res.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching item detail:", err);
      return null;
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
  const filteredData = data.filter((item) => {
    if (tabType === "Thrifting") {
      const orderItem = item as OrderData;
      const itemDetail = itemDetails[orderItem.item_id];
      const itemName = itemDetail?.name || "";
      const buyerId = orderItem.buyer_id || "";
      return (
        itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
        buyerId.toLowerCase().includes(filters.search.toLowerCase()) ||
        orderItem.id.toLowerCase().includes(filters.search.toLowerCase())
      );
    } else {
      const requestItem = item as RequestData;
      return (
        requestItem.item_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        requestItem.user_full_name
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }
  });

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
                {tabType === "Thrifting"
                  ? "Pembeli"
                  : tabType === "Sewa"
                  ? "Penyewa"
                  : "Pemohon"}
              </th>
              {tabType === "Thrifting" ? (
                <>
                  <th className="p-4 font-semibold text-gray-700">Harga</th>
                  <th className="p-4 font-semibold text-gray-700">
                    Tanggal Order
                  </th>
                </>
              ) : tabType === "Sewa" ? (
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
              filteredData.map((item) => {
                if (tabType === "Thrifting") {
                  const orderItem = item as OrderData;
                  const itemDetail = itemDetails[orderItem.item_id];

                  return (
                    <tr
                      key={orderItem.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Nama Item */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image
                              src={
                                itemDetail?.images?.[0] || "/placeholder.png"
                              }
                              alt={itemDetail?.name || "Item"}
                              width={40}
                              height={40}
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <span className="font-medium text-gray-900">
                            {itemDetail?.name || "Loading..."}
                          </span>
                        </div>
                      </td>
                      {/* Pembeli */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100">
                            <span className="text-xs font-semibold text-orange-600">
                              {orderItem.buyer_id?.slice(0, 2)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <span className="text-gray-900 text-sm">
                            {orderItem.buyer_id?.slice(0, 12) || "Unknown"}
                          </span>
                        </div>
                      </td>
                      {/* Harga */}
                      <td className="p-4 text-gray-600">
                        Rp {orderItem.total_amount?.toLocaleString("id-ID")}
                      </td>
                      {/* Tanggal Order */}
                      <td className="p-4 text-gray-600">
                        {formatDate(orderItem.created_at)}
                      </td>
                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                            orderItem.status
                          )}`}
                        >
                          {orderItem.status === "awaiting_payment"
                            ? "Menunggu Bayar"
                            : orderItem.status === "paid"
                            ? "Sudah Bayar"
                            : orderItem.status === "cancelled"
                            ? "Dibatalkan"
                            : orderItem.status}
                        </span>
                      </td>
                      {/* Aksi */}
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setModalOpen(true);
                            setSelectedOrderData(orderItem);
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
                  );
                } else {
                  const requestItem = item as RequestData;

                  return (
                    <tr
                      key={requestItem.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Nama Item */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image
                              src={
                                requestItem.item_images?.[0] ||
                                "/placeholder.png"
                              }
                              alt={requestItem.item_name}
                              width={40}
                              height={40}
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <span className="font-medium text-gray-900">
                            {requestItem.item_name}
                          </span>
                        </div>
                      </td>
                      {/* Pemohon/Penyewa */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tabType === "Sewa"
                                ? "bg-blue-100"
                                : "bg-green-100"
                            }`}
                          >
                            <span
                              className={`text-xs font-semibold ${
                                tabType === "Sewa"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {requestItem.user_full_name?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <span className="text-gray-900">
                            {requestItem.user_full_name}
                          </span>
                        </div>
                      </td>
                      {/* Tanggal/Tujuan */}
                      {tabType === "Sewa" ? (
                        <>
                          <td className="p-4 text-gray-600">
                            {formatDate(requestItem.pickup_date)}
                          </td>
                          <td className="p-4 text-gray-600">
                            {formatDate(requestItem.return_date)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 text-gray-600">
                            {requestItem.reason || "-"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {formatDate(requestItem.created_at)}
                          </td>
                        </>
                      )}
                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                            requestItem.status
                          )}`}
                        >
                          {requestItem.status.charAt(0).toUpperCase() +
                            requestItem.status.slice(1)}
                        </span>
                      </td>
                      {/* Aksi */}
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setModalOpen(true);
                            setSelectedRequestData(requestItem);
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
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Request Data (Donation/Rental) */}
      {selectedRequestData && (
        <DetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedRequestData(null);
          }}
          requestData={selectedRequestData}
          onSuccess={handleSuccess}
        />
      )}

      {/* Modal for Order Data (Thrifting) */}
      {selectedOrderData && (
        <div className={`modal ${modalOpen ? "modal-open" : ""}`}>
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Detail Order Thrifting</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedOrderData(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📋 Informasi Order</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">ID Order:</span>
                    <div className="font-medium">{selectedOrderData.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                        selectedOrderData.status
                      )}`}
                    >
                      {selectedOrderData.status === "awaiting_payment"
                        ? "Menunggu Bayar"
                        : selectedOrderData.status === "paid"
                        ? "Sudah Bayar"
                        : selectedOrderData.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Buyer ID:</span>
                    <div className="font-medium">
                      {selectedOrderData.buyer_id}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-medium text-green-600">
                      Rp{" "}
                      {selectedOrderData.total_amount?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tanggal:</span>
                    <div className="font-medium">
                      {formatDate(selectedOrderData.created_at)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Metode Kirim:</span>
                    <div className="font-medium">
                      {getShippingMethodLabel(
                        selectedOrderData.shipping_method
                      )}
                    </div>
                  </div>
                </div>
                {selectedOrderData.notes && (
                  <div className="mt-2">
                    <span className="text-gray-600">Catatan:</span>
                    <div className="font-medium">{selectedOrderData.notes}</div>
                  </div>
                )}
              </div>

              {/* Item Detail */}
              {itemDetails[selectedOrderData.item_id] && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">👕 Detail Item</h4>
                  <div className="flex space-x-4">
                    <Image
                      src={
                        itemDetails[selectedOrderData.item_id]?.images?.[0] ||
                        "/placeholder.png"
                      }
                      alt={
                        itemDetails[selectedOrderData.item_id]?.name || "Item"
                      }
                      width={80}
                      height={80}
                      className="object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-1 text-sm">
                      <div className="font-semibold">
                        {itemDetails[selectedOrderData.item_id]?.name}
                      </div>
                      <div className="text-gray-600">
                        {itemDetails[selectedOrderData.item_id]?.description}
                      </div>
                      <div className="flex space-x-4">
                        <span>
                          Size:{" "}
                          <strong>
                            {itemDetails[selectedOrderData.item_id]?.size}
                          </strong>
                        </span>
                        <span>
                          Color:{" "}
                          <strong>
                            {itemDetails[selectedOrderData.item_id]?.color}
                          </strong>
                        </span>
                        <span>
                          Condition:{" "}
                          <strong>
                            {itemDetails[selectedOrderData.item_id]?.condition}
                          </strong>
                        </span>
                      </div>
                      <div className="text-green-600 font-semibold">
                        Rp{" "}
                        {itemDetails[
                          selectedOrderData.item_id
                        ]?.price?.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedOrderData(null);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setModalOpen(false);
              setSelectedOrderData(null);
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  const searchParams = useSearchParams();
  const currentTab =
    searchParams.get("tab") === "Sewa"
      ? "Sewa"
      : searchParams.get("tab") === "Thrifting"
      ? "Thrifting"
      : "Donasi";
  const currentSearch = searchParams.get("search") || "";

  const [activeTab, setActiveTab] = useState<"Donasi" | "Sewa" | "Thrifting">(
    currentTab
  );

  // Listen for URL parameter changes and update activeTab
  useEffect(() => {
    console.log("Current tab from URL:", currentTab);
    console.log("Active tab state:", activeTab);
    setActiveTab(currentTab);
  }, [currentTab]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 md:gap-2 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Aktivitas
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Pantau aktivitas terkait donasi dan sewa Anda
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-4 w-full md:w-2/3 mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("Donasi")}
              className={`flex-1 px-4 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "Donasi"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 !text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 hover:text-gray-900 bg-transparent"
              }`}
            >
              Donasi
            </button>
            <button
              onClick={() => setActiveTab("Sewa")}
              className={`flex-1 px-4 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-300 cursor-pointer ${
                activeTab === "Sewa"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 !text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 hover:text-gray-900 bg-transparent"
              }`}
            >
              Sewa
            </button>
            <button
              onClick={() => setActiveTab("Thrifting")}
              className={
                activeTab === "Thrifting"
                  ? "flex-1 px-4 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-300 cursor-pointer bg-orange-500 text-white shadow-lg"
                  : "flex-1 px-4 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-300 cursor-pointer text-gray-600 hover:text-gray-900 bg-transparent"
              }
              style={
                activeTab === "Thrifting"
                  ? {
                      background: "linear-gradient(to right, #f97316, #ea580c)",
                      color: "white",
                    }
                  : {}
              }
            >
              Thrifting
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "Donasi" && (
            <TabContent
              tabType="Donasi"
              searchFromUrl={currentTab === "Donasi" ? currentSearch : ""}
            />
          )}
          {activeTab === "Sewa" && (
            <TabContent
              tabType="Sewa"
              searchFromUrl={currentTab === "Sewa" ? currentSearch : ""}
            />
          )}
          {activeTab === "Thrifting" && (
            <TabContent
              tabType="Thrifting"
              searchFromUrl={currentTab === "Thrifting" ? currentSearch : ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Toast from "../../components/Toast";
import { Spinner } from "../../components/Spinner";

type Order = {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  type: "rental" | "thrifting" | "donation";
  status: "awaiting_payment" | "paid" | "cancelled";
  item_price: number;
  shipping_fee: number;
  total_amount: number;
  shipping_method: string;
  distance_km: number;
  weight_kg: number;
  notes: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  request_id?: string;
};

type FilterState = {
  status: string;
  type: string;
  search: string;
  sortOrder: "desc" | "asc";
};

type OrderDetail = {
  order: Order & {
    buyer_id: string;
    seller_id: string;
    item_id: string;
    request_id?: string;
    notes: string;
    distance_km: number;
    weight_kg: number;
    shipping_method: string;
    expires_at: string;
  };
  payment: {
    id: string;
    order_id: string;
    amount: number;
    method: string;
    status: string;
    qris_payload: string;
    qris_image_url?: string;
    paid_at?: string;
    verified_at?: string;
    verified_by?: string;
    created_at: string;
    updated_at: string;
  };
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(
    new Set()
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    type: "",
    search: "",
    sortOrder: "desc",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  // Fetch orders
  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    }
  }, [user, filters]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);
      // Remove sort_order from backend params - sorting will be done in frontend

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem("access_token");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Gagal mengambil data orders");

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Apply frontend sorting
        const sortedOrders = [...result.data].sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return filters.sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });
        setOrders(sortedOrders);
      } else {
        throw new Error("Format data tidak sesuai");
      }
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (
    orderId: string,
    status: "paid" | "rejected"
  ) => {
    setProcessingOrders((prev) => new Set(prev).add(orderId));

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem("access_token");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Gagal memverifikasi pembayaran");

      const result = await response.json();
      if (result.success) {
        showToast(
          status === "paid"
            ? "Pembayaran berhasil dikonfirmasi!"
            : "Pembayaran ditolak!",
          "success"
        );
        // Refresh orders
        fetchOrders();
      } else {
        throw new Error(result.message || "Gagal memverifikasi pembayaran");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setProcessingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      type: "",
      search: "",
      sortOrder: "desc",
    });
  };

  const fetchOrderDetail = async (orderId: string) => {
    setIsLoadingDetail(true);
    setSelectedOrderId(orderId);

    try {
      // First, try to find order in existing loaded data
      const existingOrder = orders.find((order) => order.id === orderId);

      if (existingOrder) {
        console.log("Using existing order data for detail:", existingOrder);

        // Use existing order data and create detail structure
        const orderDetail = {
          order: existingOrder,
          payment: {
            id: `payment_${orderId}`,
            order_id: orderId,
            amount: existingOrder.total_amount,
            method:
              existingOrder.shipping_method === "direct_cod"
                ? "cod"
                : "bank_transfer",
            status: existingOrder.status === "paid" ? "paid" : "pending",
            qris_payload: "",
            created_at: existingOrder.created_at,
            updated_at: existingOrder.updated_at,
          },
        };

        setOrderDetail(orderDetail);
        showToast("Detail order berhasil dimuat", "success");
        return;
      }

      // If not found in existing data, show error
      throw new Error(
        "Order tidak ditemukan dalam data yang sudah dimuat. Coba refresh halaman."
      );
    } catch (err: any) {
      console.error("Error loading order detail:", err);
      showToast(err.message || "Gagal memuat detail order", "error");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      awaiting_payment: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Menunggu Pembayaran",
      },
      paid: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Sudah Bayar",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Dibatalkan",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.awaiting_payment;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      rental: { bg: "bg-purple-100", text: "text-purple-700", label: "Sewa" },
      thrifting: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Thrifting",
      },
      donation: { bg: "bg-blue-100", text: "text-blue-700", label: "Donasi" },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] || typeConfig.donation;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper functions untuk konversi ke Bahasa Indonesia
  const getPaymentStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      paid: "Sudah Bayar",
      pending: "Menunggu Bayar",
      awaiting_payment: "Menunggu Bayar",
      cancelled: "Dibatalkan",
      rejected: "Ditolak",
      failed: "Gagal",
      expired: "Kedaluwarsa",
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: { [key: string]: string } = {
      bank_transfer: "Transfer Bank",
      qris: "QRIS",
      ewallet: "E-Wallet",
      cash: "Tunai",
      cod: "Bayar di Tempat",
      Unknown: "Belum Ditentukan",
    };
    return methodMap[method] || method;
  };

  const getShippingMethodLabel = (method: string) => {
    const shippingMap: { [key: string]: string } = {
      direct_cod: "COD - Bayar di Tempat",
      courier: "Kurir Pengiriman",
      pickup: "Ambil Sendiri",
      instant: "Pengiriman Instant",
      regular: "Pengiriman Regular",
      express: "Pengiriman Express",
    };
    return shippingMap[method] || method;
  };

  const formatCurrency = (amount: number) => {
    return `Rp${amount.toLocaleString("id-ID")}`;
  };

  if (loading || (user && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Kelola dan verifikasi pembayaran orders
              </p>
            </div>
            <button
              onClick={() => fetchOrders()}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>🔄</span>
              {isLoading ? "Memuat..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 Filter & Pencarian
          </h2>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Cari berdasarkan ID order, buyer ID, atau catatan..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="awaiting_payment">Menunggu Pembayaran</option>
              <option value="paid">Sudah Bayar</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            <select
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="rental">Sewa</option>
              <option value="thrifting">Thrifting</option>
              <option value="donation">Donasi</option>
            </select>

            <select
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={filters.sortOrder}
              onChange={(e) =>
                handleFilterChange(
                  "sortOrder",
                  e.target.value as "desc" | "asc"
                )
              }
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 Daftar Orders
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner />
              <p className="mt-4 text-gray-600">Memuat data orders...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">😵</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Oops! Terjadi kesalahan
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada orders
              </h3>
              <p className="text-gray-600">
                Belum ada orders yang perlu diverifikasi
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              ID: {order.id.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              Buyer: {order.buyer_id.slice(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getTypeBadge(order.type)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Item: {formatCurrency(order.item_price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => fetchOrderDetail(order.id)}
                              disabled={isLoadingDetail}
                              className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {isLoadingDetail && selectedOrderId === order.id
                                ? "Loading..."
                                : "👁 Detail"}
                            </button>
                            {order.status === "awaiting_payment" && (
                              <>
                                <button
                                  onClick={() =>
                                    verifyPayment(order.id, "paid")
                                  }
                                  disabled={processingOrders.has(order.id)}
                                  className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  {processingOrders.has(order.id)
                                    ? "Proses..."
                                    : "✓ Konfirmasi"}
                                </button>
                                <button
                                  onClick={() =>
                                    verifyPayment(order.id, "rejected")
                                  }
                                  disabled={processingOrders.has(order.id)}
                                  className="px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  {processingOrders.has(order.id)
                                    ? "Proses..."
                                    : "✗ Tolak"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          ID: {order.id.slice(0, 12)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          Buyer: {order.buyer_id.slice(0, 12)}...
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getTypeBadge(order.type)}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-gray-500">Total:</div>
                        <div className="font-medium">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Tanggal:</div>
                        <div>{formatDate(order.created_at)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchOrderDetail(order.id)}
                        disabled={isLoadingDetail}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isLoadingDetail && selectedOrderId === order.id
                          ? "Loading..."
                          : "👁 Detail"}
                      </button>
                      {order.status === "awaiting_payment" && (
                        <>
                          <button
                            onClick={() => verifyPayment(order.id, "paid")}
                            disabled={processingOrders.has(order.id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {processingOrders.has(order.id)
                              ? "Proses..."
                              : "✓ Konfirmasi"}
                          </button>
                          <button
                            onClick={() => verifyPayment(order.id, "rejected")}
                            disabled={processingOrders.has(order.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {processingOrders.has(order.id)
                              ? "Proses..."
                              : "✗ Tolak"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {orderDetail && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="font-bold text-lg">Detail Order</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setOrderDetail(null)}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  📋 Informasi Order
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">ID Order</div>
                    <div className="font-medium">{orderDetail.order.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">ID Pembeli</div>
                    <div className="font-medium">
                      {orderDetail.order.buyer_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status Order</div>
                    <div className="mt-1">
                      {getStatusBadge(orderDetail.order.status)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Jenis Transaksi</div>
                    <div className="mt-1">
                      {getTypeBadge(orderDetail.order.type)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Total Pembayaran
                    </div>
                    <div className="font-semibold text-lg text-green-600">
                      {formatCurrency(orderDetail.order.total_amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tanggal Order</div>
                    <div className="font-medium">
                      {formatDate(orderDetail.order.created_at)}
                    </div>
                  </div>
                </div>
                {orderDetail.order.notes && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">Catatan</div>
                    <div className="bg-white p-3 rounded border">
                      {orderDetail.order.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {orderDetail.payment && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    💳 Informasi Pembayaran
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        Metode Pembayaran
                      </div>
                      <div className="font-medium">
                        {getPaymentMethodLabel(orderDetail.payment.method)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Jumlah Bayar</div>
                      <div className="font-medium">
                        {formatCurrency(orderDetail.payment.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Status Pembayaran
                      </div>
                      <div className="font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            orderDetail.payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : orderDetail.payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getPaymentStatusLabel(orderDetail.payment.status)}
                        </span>
                      </div>
                    </div>
                    {orderDetail.payment.qris_image_url && (
                      <div>
                        <div className="text-sm text-gray-600">QRIS Image</div>
                        <a
                          href={orderDetail.payment.qris_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Lihat QRIS
                        </a>
                      </div>
                    )}
                    {orderDetail.payment.paid_at && (
                      <div>
                        <div className="text-sm text-gray-600">
                          Tanggal Bayar
                        </div>
                        <div className="font-medium">
                          {formatDate(orderDetail.payment.paid_at)}
                        </div>
                      </div>
                    )}
                    {orderDetail.payment.verified_at && (
                      <div>
                        <div className="text-sm text-gray-600">
                          Tanggal Verifikasi
                        </div>
                        <div className="font-medium">
                          {formatDate(orderDetail.payment.verified_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  🚚 Informasi Pengiriman & Detail Order
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">ID Penjual</div>
                    <div className="font-medium">
                      {orderDetail.order.seller_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">ID Barang</div>
                    <div className="font-medium">
                      {orderDetail.order.item_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Metode Pengiriman
                    </div>
                    <div className="font-medium">
                      {getShippingMethodLabel(
                        orderDetail.order.shipping_method
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Jarak Pengiriman
                    </div>
                    <div className="font-medium">
                      {orderDetail.order.distance_km} km
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Berat Barang</div>
                    <div className="font-medium">
                      {orderDetail.order.weight_kg} kg
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Kadaluarsa Order
                    </div>
                    <div className="font-medium">
                      {formatDate(orderDetail.order.expires_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Fixed Footer */}
            {orderDetail.order.status === "awaiting_payment" && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => {
                    verifyPayment(orderDetail.order.id, "paid");
                    setOrderDetail(null);
                  }}
                  disabled={processingOrders.has(orderDetail.order.id)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processingOrders.has(orderDetail.order.id)
                    ? "Memproses..."
                    : "✓ Konfirmasi Pembayaran"}
                </button>
                <button
                  onClick={() => {
                    verifyPayment(orderDetail.order.id, "rejected");
                    setOrderDetail(null);
                  }}
                  disabled={processingOrders.has(orderDetail.order.id)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processingOrders.has(orderDetail.order.id)
                    ? "Memproses..."
                    : "✗ Tolak Pembayaran"}
                </button>
              </div>
            )}
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setOrderDetail(null)}
          ></div>
        </div>
      )}
    </div>
  );
}

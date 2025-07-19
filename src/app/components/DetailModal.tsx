import React, { useState } from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

export function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DetailModal({
  open,
  onClose,
  requestData,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  requestData: any | null;
  onSuccess?: () => void;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const defaultImage = "/shirt.webp";

  function formatPhoneNumber(phone: string) {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    // If starts with 0, replace with 62
    if (cleaned.startsWith("0")) {
      return "62" + cleaned.slice(1);
    }
    return cleaned;
  }

  // Add handleStatusUpdate function
  const handleStatusUpdate = async (newStatus: string, rejectionReason?: string) => {
    if (!requestData?.id) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const body: { status: string; rejection_reason?: string } = {
        status: newStatus,
      };

      if (newStatus === "rejected") {
        body.rejection_reason = " ";
      }

      const response = await fetch(`/api/requests/${requestData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        // Notify parent component to refresh data
        if (onSuccess) onSuccess();
        
        // Close modal on success
        onClose();
      } else {
        // Check if it's the specific stock error
        if (data.error && 
            data.error.type === "DATABASE_ERROR" && 
            data.error.message === "Failed to update item stock (decrement)") {
          setShowStockModal(true);
        } else {
          throw new Error(data.message || "Failed to update status");
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Might want to show an error toast/alert here
    } finally {
      setActionLoading(false);
    }
  };

  if (!open) return null;

  // Use requestData directly instead of fetching
  const detail = requestData;
  const type = detail?.type;
  const status = detail?.status || "";
  const isDonation = type === "donation";
  const isRental = type === "rental";

  // Extract data from the complete request object
  const itemName = detail?.item_name || "-";
  const itemImages = detail?.item_images && detail.item_images.length > 0 ? detail.item_images : [defaultImage];
  const categoryName = detail?.category_name || "-";
  const itemPrice = detail?.item_price ? `Rp${detail.item_price.toLocaleString("id-ID")}` : "-";
  const size = detail?.item_size || "-";
  const tanggal = detail?.created_at ? formatDate(detail.created_at) : "-";
  const tujuan = detail?.reason || "-";
  const pickupDate = detail?.pickup_date ? formatDate(detail.pickup_date) : "-";
  const updatedAt = detail?.updated_at ? formatDate(detail.updated_at) : "-";
  const returnDate = detail?.return_date ? formatDate(detail.return_date) : "-";
  const jumlah = detail?.quantity || "-";
  const userFullName = detail?.user_full_name || "-";
  const userPhone = detail?.user_phone || detail?.contact_info || "";
  const whatsapp = userPhone ? `https://wa.me/${formatPhoneNumber(userPhone)}` : "#";

  // Modal content by type & status
  return (
    <dialog id="detail_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <h3 className="font-bold text-lg">Detail Aktivitas</h3>
          {/* Tombol close DaisyUI*/}
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            ✕
          </button>
        </div>

        {/* KONTEN UTAMA */}
        <div className="py-4">
          {!detail ? (
            // --- ERROR STATE: Gunakan alert agar lebih menonjol ---
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Data tidak dapat ditemukan. Silakan coba lagi.</span>
            </div>
          ) : (
            // --- KONTEN UTAMA JIKA DATA ADA ---
            <div className="space-y-6">
              {/* Bagian 1: Detail Barang Utama */}
              <div className="flex flex-col sm:flex-row gap-5">
                <figure className="w-full sm:w-32 h-32 flex-shrink-0">
                  <Image
                    src={itemImages[0]}
                    alt={itemName}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full rounded-box bg-base-200"
                  />
                </figure>
                <div className="flex-1 space-y-2">
                  <h2 className="card-title text-lg md:text-2xl">{itemName}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge untuk highlight info kunci */}
                    <div className="badge badge-primary badge-outline">
                      Size : {size}
                    </div>
                    <div className="badge badge-primary badge-outline">
                      {categoryName}
                    </div>
                    {isRental && (
                      <div className="badge badge-outline">Harga: {itemPrice}</div>
                    )}
                  </div>
                  <p className="text-sm text-base-content/70 pt-2">
                    Diajukan oleh:{" "}
                    <span className="font-semibold text-base-content">
                      {userFullName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="divider my-0"></div>

              {/* Bagian 2: Detail Transaksi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {isDonation && (
                  <>
                    <div>
                      <div className="text-xs text-base-content/60">
                        Tanggal Pengajuan
                      </div>
                      <div className="font-medium">{tanggal}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-base-content/60">Tujuan</div>
                      <div className="font-medium">{tujuan}</div>
                    </div>
                  </>
                )}
                {isRental && (
                  <>
                    <div>
                      <div className="text-xs text-base-content/60">
                        Tanggal Mulai
                      </div>
                      <div className="font-medium">{pickupDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60">
                        Tanggal Selesai
                      </div>
                      <div className="font-medium">{returnDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60">Jumlah</div>
                      <div className="font-medium">{jumlah}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Bagian 3: Status & Informasi Tambahan */}
              {isDonation && status === "completed" && (
                <div role="alert" className="alert alert-success text-sm">
                  <span>Donasi telah diterima pada {updatedAt}</span>
                </div>
              )}
              {isRental && status === "completed" && (
                <div role="alert" className="alert alert-success text-sm">
                  <span>Sewa telah selesai.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIONS FOOTER */}
        {detail && (
          <div className="flex flex-col md:flex-row gap-2 md:modal-action md:items-center">
            {/* Tombol WhatsApp sebagai Call to Action */}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-success gap-2 mr-auto"
            >
              <FaWhatsapp className="text-lg" />
              Hubungi Pengguna via WhatsApp
            </a>

            {/* DONASI ACTIONS */}
            {isDonation && status === "pending" && (
              <div className="space-x-2 mt-4 md:mt-0 flex justify-end">
                <button
                  className="btn btn-ghost"
                  onClick={() => handleStatusUpdate("rejected", "")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Tolak"
                  )}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Terima"
                  )}
                </button>
              </div>
            )}
            {isDonation && status === "approved" && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatusUpdate("completed")}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Tandai Sudah Diterima"
                )}
              </button>
            )}

            {/* SEWA ACTIONS */}
            {isRental && status === "pending" && (
              <div className="space-x-2 mt-4 md:mt-0 flex justify-end">
                <button
                  className="btn btn-ghost"
                  onClick={() => handleStatusUpdate("rejected", "")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Tolak"
                  )}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Terima"
                  )}
                </button>
              </div>
            )}
            {isRental && status === "approved" && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatusUpdate("completed")}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Tandai Sudah Dikembalikan"
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Backdrop untuk menutup modal saat diklik di luar area */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>

      {/* Stock Error Modal */}
      {showStockModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error text-center">Stok Habis!</h3>
            <p className="pt-4 text-center">
              Maaf, item "{itemName}" saat ini sudah habis.
            </p>
            <p className="text-center text-base">
              Permintaan tidak dapat diproses saat ini.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowStockModal(false)}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
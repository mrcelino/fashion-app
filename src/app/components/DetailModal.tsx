import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Spinner from "./Spinner";

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
  requestId,
  type,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
  type: "donation" | "rental" | null;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
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
    if (!requestId) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
    const body: { status: string; rejection_reason?: string } = {
      status: newStatus,
    };

    if (newStatus === "rejected") {
      body.rejection_reason = " ";
    }

  const response = await fetch(`/api/requests/${requestId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

    const data = await response.json();
    
    if (data.success) {
      // Update local state
      setDetail((prev: any) => ({
        ...prev,
        status: newStatus,
      }));
      
      // Notify parent component
      if (onSuccess) onSuccess();

      // Optional: Close modal on success
      // onClose();
    } else {
      throw new Error(data.message || "Failed to update status");
    }
    } catch (error) {
      console.error("Error updating status:", error);
      // Might want to show an error toast/alert here
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !requestId) return;

      setLoading(true);
      setDetail(null);

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`/api/requests/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const res = await response.json();

        if (res.success && res.data) {
          setDetail(res.data);
        } else {
          setDetail(null);
        }
      } catch (error) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, requestId]);


  if (!open) return null;

  // Fallback/mock data
  const item = detail?.item || {};
  const user = detail?.user || {};
  const status = detail?.status || "";
  const isDonation = type === "donation";
  const isRental = type === "rental";

  // Fallbacks
  const size = item.size || "-";
  const images = item.images && item.images.length > 0 ? item.images : [defaultImage];
  const category = item.category || "-";
  const price = item.price ? `Rp${item.price.toLocaleString("id-ID")}` : "-";
  const tanggal = detail?.created_at ? formatDate(detail.created_at) : "-";
  const tujuan = detail?.reason || "-";
  const pickupDate = detail?.pickup_date ? formatDate(detail.pickup_date) : "-";
  const updatedAt = detail?.updated_at ? formatDate(detail.updated_at) : "-";
  const returnDate = detail?.return_date ? formatDate(detail.return_date) : "-";
  const jumlah = detail?.quantity || "-";
  const whatsapp = user.phone ? `https://wa.me/${formatPhoneNumber(user.phone)}` : "#";

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
          {loading ? (
            // --- LOADING STATE: spinner untuk feedback visual yang lebih baik ---
            <Spinner />
          ) : !detail ? (
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
                    src={images[0]}
                    alt={item.name || "Item"}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full rounded-box bg-base-200"
                  />
                </figure>
                <div className="flex-1 space-y-2">
                  <h2 className="card-title text-2xl">{item.name || "-"}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge untuk highlight info kunci */}
                    <div className="badge badge-outline">Size: {size}</div>
                    {isDonation && (
                      <div className="badge badge-primary badge-outline">
                        {category}
                      </div>
                    )}
                    {isRental && (
                      <div className="badge badge-outline">Harga: {price}</div>
                    )}
                  </div>
                  <p className="text-sm text-base-content/70 pt-2">
                    Diajukan oleh:{" "}
                    <span className="font-semibold text-base-content">
                      {user.full_name || "-"}
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
              {/* Alert untuk status profesional & jelas */}
              {/* {isDonation && status === "approved" && <div role="alert" className="alert alert-info text-sm"><span>Menunggu donasi diterima.</span></div>} */}
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

        {/* ACTIONS FOOTER:
        Semua tombol aksi ditaruh di sini agar konsisten dan mudah dijangkau.
      */}
        {!loading && detail && (
          <div className="modal-action mt-6 items-center">
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
              <div className="space-x-2">
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
              <div className="space-x-2">
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
    </dialog>
  );
}
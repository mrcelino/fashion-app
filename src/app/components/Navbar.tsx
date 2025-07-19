"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <div className="navbar bg-white fixed top-0 left-0 w-full z-50 p-2 shadow-sm flex items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Info />
        </div>

        {/* Notifications & Profile Desktop */}
        <div className="hidden lg:flex items-center space-x-4">
          <NotificationBell />
          <Profile />
        </div>

        {/* Notifications & Hamburger Mobile */}
        <div className="lg:hidden flex items-center space-x-2">
          <NotificationBell />
          <button
            onClick={toggleMobileMenu}
            className="p-2 bg-white rounded-full hover:bg-[#285A22] transition duration-300"
          >
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      {/* Dropdown Mobile */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-white shadow-md rounded-b-xl flex flex-col items-center py-4 space-y-4 lg:hidden z-50">
          <MobileMenu onClose={() => setIsMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}

function Info() {
  return (
    <>
      <Link
        href="/dashboard"
        className="text-lg text-black md:text-xl font-semibold"
      >
        <span className="text-green-500">Satu</span>Lemari
      </Link>
    </>
  );
}

function Profile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, setUser, setToken, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
          <img
            src={user?.photo || "/user.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <svg
          className="w-4 h-4 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={user?.photo || "/user.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {loading ? "Loading..." : user?.username || "-"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || "-"}</p>
                </div>
              </div>
            </div>

            <div className="px-2 py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
              >
                <span>Logout</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Overlay untuk tutup dropdown saat klik luar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        </>
      )}
    </div>
  );
}

// Fungsi logout
async function handleLogout(
  setUser?: (u: any) => void,
  setToken?: (t: any) => void
) {
  try {
    const token = localStorage.getItem("access_token");
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    localStorage.removeItem("access_token");
    if (setUser) setUser(null);
    if (setToken) setToken(null);
    window.location.href = "/login";
  } catch (error) {
    alert("Logout gagal. Silakan coba lagi.");
  }
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { setUser, setToken } = useAuth();
  return (
    <>
      <Link
        href="/dashboard"
        className="text-base text-black font-semibold"
        onClick={onClose}
      >
        Beranda
      </Link>
      <Link
        href="/dashboard/listings"
        className="text-base text-black font-semibold"
        onClick={onClose}
      >
        Etalaseku
      </Link>
      <Link
        href="/dashboard/activity"
        className="text-base text-black font-semibold"
        onClick={onClose}
      >
        Aktivitas
      </Link>
      <Link
        href="/dashboard/add-items"
        className="text-base text-black font-semibold"
        onClick={onClose}
      >
        Tambah Item
      </Link>
      <Link
        href="/dashboard/profile"
        className="text-base text-black font-semibold"
        onClick={onClose}
      >
        Pengaturan Akun
      </Link>
      {/* logout */}
      <button
        onClick={async () => {
          onClose();
          await handleLogout(setUser, setToken);
        }}
        className="text-base text-red-600 font-semibold"
      >
        Logout
      </button>
    </>
  );
}

// Types for notifications
interface NotificationData {
  item_name: string;
  request_id: string;
  type: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data: NotificationData;
  is_read: boolean;
  is_sent: boolean;
  platform: string;
  created_at: string;
}

interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  today_count: number;
  week_count: number;
}

function NotificationBell() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/notifications/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark multiple notifications as read
  const markMultipleAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/notifications/mark-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_ids: selectedNotifications,
        }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            selectedNotifications.includes(notif.id)
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setSelectedNotifications([]);
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsDropdownOpen(false);

    // Navigate to activity page with appropriate tab and search
    if (notification.data && notification.data.type && notification.data.item_name) {
      const tab = notification.data.type === "rental" ? "Sewa" : "Donasi";
      const search = encodeURIComponent(notification.data.item_name);
      router.push(`/dashboard/activity?tab=${tab}&search=${search}`);
    } else {
      // Fallback to activity page without parameters
      router.push("/dashboard/activity");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Baru saja";
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInHours < 48) return "Kemarin";
    return date.toLocaleDateString("id-ID");
  };

  // Load data when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchNotifications();
      fetchStats();
    }
  }, [isDropdownOpen]);

  // Load stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
      >
        <FaBell />

        {/* Notification badge */}
        {stats && stats.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {stats.unread_count > 99 ? "99+" : stats.unread_count}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <>
          <div className="absolute -right-6 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none flex flex-col max-h-96">
            {/* Header */}
            <div className="px-3 sm:px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Notifikasi
              </h3>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {selectedNotifications.length > 0 && (
                  <>
                    <button
                      onClick={markMultipleAsRead}
                      className="text-xs bg-blue-500 text-white px-1.5 sm:px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Tandai Terbaca
                    </button>
                  </>
                )}
                <button
                  onClick={markAllAsRead}
                  className="text-xs bg-green-500 text-white px-1.5 sm:px-2 py-1 rounded hover:bg-green-600"
                >
                  Tandai Semua
                </button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="px-3 sm:px-4 py-2 bg-gray-50 text-xs text-gray-600 border-b border-gray-100 flex-shrink-0">
                {stats.unread_count} belum dibaca dari{" "}
                {stats.total_notifications} total
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v6m0 0l3-3m-3 3l-3-3"
                    />
                  </svg>
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-2 sm:p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onChange={() =>
                          toggleNotificationSelection(notification.id)
                        }
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Hapus notifikasi"
                            >
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.created_at)}
                          </span>

                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Tandai dibaca
                            </button>
                          )}
                        </div>

                        {notification.data && notification.data.type && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {notification.data.type === "rental"
                                ? "Sewa"
                                : notification.data.type === "donation"
                                ? "Donasi"
                                : notification.data.type}
                              : {notification.data.item_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        </>
      )}
    </div>
  );
}

export default Profile;

"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Cek apakah user sudah login dengan cara yang lebih simple
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setCheckingAuth(false);
          return;
        }

        // Cek token dengan API
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Token valid, redirect ke dashboard
          router.push("/dashboard");
        } else {
          // Token tidak valid, hapus dan tampilkan login
          localStorage.removeItem("access_token");
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("access_token");
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Tampilkan loading saat mengecek status autentikasi
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
      const { app } = await import("../../lib/firebaseClient");

      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: idToken,
          type: "firebase",
          platform: "web",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Token verification failed");
      
      // Check user role - only allow partners to access dashboard
      if (data.data.user.role !== "partner") {
        setMessage("Akses ditolak");
        return;
      }
      
      localStorage.setItem("access_token", data.data.access_token);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        // Handle Firebase authentication errors
        if (error.message.includes("auth/invalid-credential") || 
            error.message.includes("INVALID_LOGIN_CREDENTIALS")) {
          setMessage("Email atau kata sandi salah");
        } else if (error.message.includes("auth/user-not-found")) {
          setMessage("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
        } else if (error.message.includes("auth/wrong-password")) {
          setMessage("Kata sandi salah. Silakan coba lagi.");
        } else if (error.message.includes("auth/too-many-requests")) {
          setMessage("Terlalu banyak percobaan login. Silakan coba lagi nanti.");
        } else if (error.message.includes("auth/user-disabled")) {
          setMessage("Akun Anda telah dinonaktifkan. Hubungi administrator.");
        } else if (error.message.includes("auth/invalid-email")) {
          setMessage("Format email tidak valid.");
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage("Login gagal. Silakan coba lagi.");
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { app } = await import("../../lib/firebaseClient");

      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();

      // Ambil username
      let username = user.displayName || user.email?.split("@")[0] || "user";
      username = username.trim().toLowerCase().replace(/\s+/g, "_");

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: idToken,
          type: "firebase",
          platform: "web",
          username,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Token verification failed");
      
      // Check user role - only allow partners to access dashboard
      if (data.data.user.role !== "partner") {
        setMessage("Akses ditolak");
        return;
      }
      
      localStorage.setItem("access_token", data.data.access_token);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        // Handle Firebase authentication errors for Google login
        if (error.message.includes("auth/popup-closed-by-user")) {
          setMessage("Login dibatalkan. Silakan coba lagi.");
        } else if (error.message.includes("auth/popup-blocked")) {
          setMessage("Popup diblokir browser. Silakan izinkan popup dan coba lagi.");
        } else if (error.message.includes("auth/cancelled-popup-request")) {
          setMessage("Login dibatalkan. Silakan coba lagi.");
        } else if (error.message.includes("auth/network-request-failed")) {
          setMessage("Koneksi internet bermasalah. Silakan coba lagi.");
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage("Login dengan Google gagal. Silakan coba lagi.");
      }
    }
    setLoading(false);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center gap-4 bg-white min-h-[350px] md:h-fit p-4 md:p-6 xl:p-12 rounded-xl md:rounded-[30px] w-full max-w-[355px] md:max-w-sm lg:max-w-full lg:w-1/3 shadow-lg border-2 border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg md:text-2xl font-semibold">Login</h2>
          <h2 className="font-medium text-base md:text-base">Selamat datang di SatuLemari</h2>
        </div>

        {message && <p className="text-red-500 text-sm font-medium">{message}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="w-full gap-4 flex flex-col items-center"
        >
          <div className="flex flex-col gap-6 mt-2 md:mt-4 w-5/6 md:w-full">
            <input
              type="email"
              placeholder="Email"
              className="bg-gray-50 text-gray-800 placeholder-gray-500 font-medium rounded-xl md:rounded-2xl py-3 px-4 text-sm md:text-base border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Kata Sandi"
              className="bg-gray-50 text-gray-800 placeholder-gray-500 font-medium rounded-xl md:rounded-2xl py-3 px-4 text-sm md:text-base border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Link href="/register" className="font-semibold text-xs md:text-sm ml-2 hover:text-gray-800 hover:scale-95 transition duration-400">
              Belum punya akun?
            </Link>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`flex space-x-2 items-center justify-center ${
                loading || !email || !password
                  ? "bg-[#3D74B6]/50 cursor-not-allowed"
                  : "bg-[#3D74B6] hover:bg-[#2C5B87]"
              } text-white text-sm md:text-base font-semibold rounded-xl md:rounded-2xl py-3 px-4 cursor-pointer transition-colors duration-200`}
            >
              <Image
                src="/upload.png"
                alt="upload icon"
                width={20}
                height={20}
                className="size-4"
              />
              <h2>{loading ? "Masuk..." : "Masuk"}</h2>
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex space-x-2 items-center justify-center border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl py-3 px-4 transition-colors duration-200"
            >
              <Image
                src="/google_icon.webp"
                alt="Google icon"
                width={20}
                height={20}
                className="size-4"
              />
              <span>{loading ? "Memproses..." : "Masuk dengan Google"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

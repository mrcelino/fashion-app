"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword.length > 0 && newPassword.length < 6) {
      setPasswordError("Kata sandi harus minimal 6 karakter");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validasi password sebelum submit
    if (password.length < 6) {
      setPasswordError("Kata sandi harus minimal 6 karakter");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setPasswordError("");
    try {
      const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { app } = await import("../../lib/firebaseClient");

      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // username
      const username = name.trim().toLowerCase().replace(/\s+/g, "_");

      await updateProfile(userCredential.user, { displayName: username });

      const idToken = await userCredential.user.getIdToken();

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
      localStorage.setItem("access_token", data.data.access_token);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) setMessage(error.message);
      else setMessage("Registration failed: Unknown error");
    }
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
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

      // username: ambil dari displayName dan proses
      const displayName = user.displayName || "pengguna";
      const username = displayName.trim().toLowerCase().replace(/\s+/g, "_");

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
      localStorage.setItem("access_token", data.data.access_token);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) setMessage(error.message);
      else setMessage("Google registration failed: Unknown error");
    }
    setLoading(false);
  };


  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center justify-center gap-4 bg-white min-h-[400px] md:h-fit p-3 md:p-6 lg:p-12 rounded-xl md:rounded-[30px] w-full max-w-[355px] md:max-w-sm lg:max-w-full lg:w-1/3 shadow-lg border-2 border-gray-200">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg md:text-2xl font-semibold">Register</h2>
        <h2 className="font-medium text-base md:text-base">Selamat datang di SatuLemari</h2>
      </div>

      {message && <p className="text-red-500 text-lg font-medium">Register gagal</p>}

      <form onSubmit={handleSubmit} className="w-full gap-4 flex flex-col items-center">
        <div className="flex flex-col gap-5 mt-2 md:mt-4 w-5/6 md:w-full">
          <input
            type="text"
            placeholder="Username"
            className="bg-gray-50 text-gray-800 placeholder-gray-500 font-medium rounded-xl md:rounded-2xl py-3 px-4 text-sm md:text-base border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-gray-50 text-gray-800 placeholder-gray-500 font-medium rounded-xl md:rounded-2xl py-3 px-4 text-sm md:text-base border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div className="w-full">
            <input
              type="password"
              placeholder="Kata Sandi"
              className={`w-full bg-gray-50 text-gray-800 placeholder-gray-500 font-medium rounded-xl md:rounded-2xl py-3 px-4 text-sm md:text-base border ${
                passwordError ? 'border-red-500' : 'border-gray-200'
              } focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100`}
              value={password}
              onChange={handlePasswordChange}
              required
              autoComplete="new-password"
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-2 ml-2">{passwordError}</p>
            )}
          </div>
          <Link href="/login" className="font-semibold text-xs md:text-sm ml-2hover:text-gray-800">
            Sudah punya akun?
          </Link>
          <button
            type="submit"
            disabled={loading || !name || !email || !password || passwordError !== "" || password.length < 6}
            className={`flex space-x-2 items-center justify-center ${
              loading || !name || !email || !password || passwordError !== "" || password.length < 6
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
            <h2>{loading ? "Mendaftar..." : "Daftar"}</h2>
          </button>
          <button
            type="button"
            onClick={handleGoogleRegister}
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
            <span>{loading ? "Memproses..." : "Daftar dengan Google"}</span>
          </button>

        </div>
      </form>
    </div>
  </div>
  );
}

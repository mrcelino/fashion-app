"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AOS from "aos";
import { motion, AnimatePresence } from "framer-motion";
import "aos/dist/aos.css";

// Reusable Components
const FeatureCard = ({
  icon,
  title,
  description,
  bgColor = "bg-white",
  hoverEffect = true,
}: {
  icon: string;
  title: string;
  description: string;
  bgColor?: string;
  hoverEffect?: boolean;
}) => (
  <div
    className={`${bgColor} rounded-2xl p-8 shadow-lg ${
      hoverEffect
        ? "hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        : ""
    }`}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const ProcessStep = ({
  icon,
  title,
  description,
  bgColor,
  iconBg,
}: {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  iconBg: string;
}) => (
  <div className="text-center group">
    <div
      className={`${iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:${bgColor} transition-colors`}
    >
      <span className="text-3xl">{icon}</span>
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-3">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

const UserTypeCard = ({
  icon,
  title,
  benefits,
  bgGradient,
  dotColor,
}: {
  icon: string;
  title: string;
  benefits: string[];
  bgGradient: string;
  dotColor: string;
}) => (
  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
    <div className="text-center mb-6">
      <div
        className={`w-20 h-20 ${bgGradient} rounded-full flex items-center justify-center mx-auto mb-4`}
      >
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
    </div>
    <div className="space-y-4">
      {benefits.map((benefit, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div
            className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`}
          ></div>
          <p className="text-gray-700">{benefit}</p>
        </div>
      ))}
    </div>
  </div>
);

const PricingCard = ({
  title,
  price,
  description,
  features,
  buttonText,
  buttonColor,
  borderColor,
  isPopular = false,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonColor: string;
  borderColor: string;
  isPopular?: boolean;
}) => (
  <div
    className={`bg-white rounded-2xl p-8 border-2 ${borderColor} ${
      isPopular
        ? "relative transform scale-105"
        : "hover:border-green-300 transition-colors"
    }`}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Terpopuler
        </span>
      </div>
    )}
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <div
        className={`text-4xl font-bold ${buttonColor.replace(
          "bg-",
          "text-"
        )} mb-2`}
      >
        {price}
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3">
          <div
            className={`w-5 h-5 ${buttonColor} rounded-full flex items-center justify-center`}
          >
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      href="/register"
      className={`w-full ${buttonColor} text-white py-3 rounded-lg font-semibold hover:${buttonColor.replace(
        "500",
        "600"
      )} transition-colors text-center block`}
    >
      {buttonText}
    </Link>
  </div>
);

const StatCard = ({
  value,
  label,
  sublabel,
  color,
  delay,
}: {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
}) => (
  <div
    className="text-center"
    data-aos="zoom-in"
    data-aos-duration="1000"
    data-aos-delay={delay}
  >
    <div className={`text-4xl md:text-5xl font-bold ${color} mb-2`}>
      {value.toLocaleString()}+
    </div>
    <div className="text-lg text-gray-700 font-medium">{label}</div>
    <div className="text-sm text-gray-600">{sublabel}</div>
  </div>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [partnersCount, setPartnersCount] = useState(0);
  const [itemsListed, setItemsListed] = useState(0);
  const [wasteReduced, setWasteReduced] = useState(0);
  const [activeTab, setActiveTab] = useState("partner");
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentCtaSlide, setCurrentCtaSlide] = useState(0);

  // Hero carousel data
  const heroSlides = [
    {
      type: "partner",
      title: "Ciptakan Dampak Positif",
      subtitle: "untuk Bumi & Sesama",
      description:
        "Bergabunglah dengan gerakan fashion berkelanjutan. Bagikan koleksi fashion Anda, kurangi limbah tekstil, dan ciptakan ekonomi circular yang berdampak.",
      primaryCta: "Daftar Sebagai Mitra",
      primaryLink: "/register",
      secondaryCta: "Pelajari Lebih Lanjut",
      secondaryLink: "#platform",
      bgGradient: "from-green-50 to-emerald-50",
      accentColor: "green",
      features: [
        {
          icon: "🌍",
          label: "Dampak Lingkungan",
          bg: "bg-green-100",
          text: "text-green-700",
        },
        {
          icon: "🤝",
          label: "Komunitas",
          bg: "bg-emerald-100",
          text: "text-emerald-700",
        },
        {
          icon: "♻️",
          label: "Circular Economy",
          bg: "bg-teal-100",
          text: "text-teal-700",
        },
        {
          icon: "💚",
          label: "Sustainable Living",
          bg: "bg-lime-100",
          text: "text-lime-700",
        },
      ],
    },
    {
      type: "user",
      title: "Fashion Berkelanjutan",
      subtitle: "untuk Semua",
      description:
        "Akses ribuan fashion berkualitas dengan cara yang ramah lingkungan. Sewa untuk acara spesial atau dapatkan gratis melalui donasi komunitas.",
      primaryCta: "Download Aplikasi",
      primaryLink: "#download",
      secondaryCta: "Pelajari Lebih Lanjut",
      secondaryLink: "#platform",
      bgGradient: "from-blue-50 to-indigo-50",
      accentColor: "blue",
      features: [
        {
          icon: "🌱",
          label: "Eco-Friendly",
          bg: "bg-blue-100",
          text: "text-blue-700",
        },
        {
          icon: "👗",
          label: "Fashion Access",
          bg: "bg-indigo-100",
          text: "text-indigo-700",
        },
        {
          icon: "🎁",
          label: "Free Sharing",
          bg: "bg-purple-100",
          text: "text-purple-700",
        },
        {
          icon: "💝",
          label: "Care Community",
          bg: "bg-pink-100",
          text: "text-pink-700",
        },
      ],
    },
  ];

  // CTA slider data
  const ctaSlides = [
    {
      type: "partner",
      title: "Siap Menjadi Mitra SatuLemari?",
      description:
        "Bergabunglah dengan ekosistem fashion circular dan raih keuntungan sambil berkontribusi pada lingkungan",
      cta: "Daftar Sebagai Mitra",
      link: "/register",
      bgGradient: "from-green-100 via-emerald-100 to-teal-100",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      type: "user",
      title: "Siap Bergabung dengan Komunitas Fashion Berkelanjutan?",
      description:
        "Download aplikasi SatuLemari dan mulai sewa fashion berkualitas atau dapatkan donasi gratis dari komunitas",
      cta: "Download Aplikasi",
      link: "#download",
      bgGradient: "from-blue-100 via-indigo-100 to-purple-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: false,
      offset: 100,
    });
  }, []);

  // Hero carousel auto-slide
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(heroInterval);
  }, []);

  // CTA slider auto-slide
  useEffect(() => {
    const ctaInterval = setInterval(() => {
      setCurrentCtaSlide((prev) => (prev + 1) % ctaSlides.length);
    }, 5000);
    return () => clearInterval(ctaInterval);
  }, []);

  const animateCounter = (
    setter: any,
    target: number,
    duration: number,
    delay: number = 0
  ) => {
    setTimeout(() => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    }, delay);
  };

  const startCounterAnimation = () => {
    if (!hasAnimated) {
      setHasAnimated(true);
      animateCounter(setPartnersCount, 850, 2000, 0);
      animateCounter(setItemsListed, 12500, 2000, 300);
      animateCounter(setWasteReduced, 2800, 2000, 600);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id === "impact-section") {
            startCounterAnimation();
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -100px 0px",
      }
    );
    const impactSection = document.getElementById("impact-section");
    if (impactSection) {
      observer.observe(impactSection);
    }
    return () => {
      if (impactSection) {
        observer.unobserve(impactSection);
      }
    };
  }, [hasAnimated]);

  const navLinks = [
    { href: "#home", label: "Beranda" },
    { href: "#platform", label: "Platform" },
    { href: "#users", label: "Pengguna" },
    { href: "#features", label: "Fitur" },
    { href: "#partnership", label: "Kemitraan" },
  ];

  const partnerSteps = [
    {
      icon: "📝",
      title: "1. Daftar & Verifikasi",
      description:
        "Daftarkan diri sebagai mitra dan lengkapi pengisian akun untuk memulai",
    },
    {
      icon: "📦",
      title: "2. Upload Inventaris",
      description:
        "Tambahkan produk fashion dengan foto, deskripsi, dan harga sewa",
    },
    {
      icon: "🎯",
      title: "3. Kelola Pesanan",
      description: "Terima dan kelola pesanan sewa/donasi dari user mobile",
    },
    {
      icon: "💰",
      title: "4. Raih Keuntungan",
      description:
        "Dapatkan penghasilan dari sewa dan dampak positif dari donasi",
    },
  ];

  const userSteps = [
    {
      icon: "🔍",
      title: "1. Jelajahi Katalog",
      description: "Browse ribuan item fashion untuk disewa atau donasi gratis",
    },
    {
      icon: "📱",
      title: "2. Pesan Mudah",
      description: "Ajukan sewa atau request donasi langsung dari aplikasi",
    },
    {
      icon: "💬",
      title: "3. Chat dengan Mitra",
      description: "Tunggu approval atau komunikasi langsung dengan pemilik",
    },
    {
      icon: "📦",
      title: "4. Terima Barang",
      description: "Pickup atau delivery sesuai kesepakatan dengan mitra",
    },
  ];

  const userTypes = [
    {
      icon: "👩‍👧‍👦",
      title: "Ibu Rumah Tangga",
      benefits: [
        "Hemat budget keluarga dengan sewa baju kondangan & acara khusus",
        "Donasikan baju anak yang sudah kekecilan untuk keluarga lain",
        "Temukan pakaian berkualitas untuk kebutuhan sehari-hari",
        "Bergabung dengan komunitas yang saling mendukung",
      ],
      bgGradient: "bg-gradient-to-br from-pink-100 to-pink-200",
      dotColor: "bg-pink-400",
    },
    {
      icon: "🎓",
      title: "Mahasiswa",
      benefits: [
        "Sewa outfit kece untuk acara kampus dengan budget terbatas",
        "Dapat baju formal untuk presentasi, magang & job interview",
        "Cari side income dengan menyewakan pakaian premium",
        "Akses fashion berkualitas tanpa harus beli",
      ],
      bgGradient: "bg-gradient-to-br from-blue-100 to-blue-200",
      dotColor: "bg-blue-400",
    },
    {
      icon: "💼",
      title: "Pekerja Kantoran",
      benefits: [
        "Variasi outfit kantor tanpa beli baju baru terus",
        "Sewa blazer & dress untuk meeting penting & networking",
        "Donasikan pakaian kerja yang sudah bosan dipakai",
        "Tampil profesional dengan budget efisien",
      ],
      bgGradient: "bg-gradient-to-br from-green-100 to-green-200",
      dotColor: "bg-green-400",
    },
    {
      icon: "🎨",
      title: "Content Creator",
      benefits: [
        "Sewa outfit unik untuk konten foto & video",
        "Akses fashion trending tanpa investasi besar",
        "Kolaborasi dengan brand fashion lokal",
        "Monetize wardrobe pribadi dengan menyewakan",
      ],
      bgGradient: "bg-gradient-to-br from-purple-100 to-purple-200",
      dotColor: "bg-purple-400",
    },
    {
      icon: "🚀",
      title: "Entrepreneur",
      benefits: [
        "Tampil profesional di meeting & networking event",
        "Sewa outfit formal untuk pitching & presentasi",
        "Ekspansi bisnis fashion dengan model rental",
        "Diversifikasi income stream dari fashion",
      ],
      bgGradient: "bg-gradient-to-br from-orange-100 to-orange-200",
      dotColor: "bg-orange-400",
    },
    {
      icon: "✨",
      title: "Fashion Enthusiast",
      benefits: [
        "Eksplorasi style baru tanpa komitmen beli",
        "Akses designer pieces dengan harga terjangkau",
        "Berbagi koleksi fashion dengan sesama enthusiast",
        "Sustainable fashion lifestyle yang stylish",
      ],
      bgGradient: "bg-gradient-to-br from-teal-100 to-teal-200",
      dotColor: "bg-teal-400",
    },
  ];

  const features = [
    {
      icon: "🤖",
      title: "AI Smart Listing",
      description:
        "Cukup upload foto, AI bantu isi deskripsi, kategori, dan detail produk otomatis.",
    },
    {
      icon: "🚀",
      title: "Dashboard Canggih",
      description:
        "Kelola inventaris, pesanan, dan analitik bisnis dalam satu platform terintegrasi",
    },
    {
      icon: "🔔",
      title: "Notifikasi Real-time",
      description:
        "Dapatkan pemberitahuan langsung terkait aktivitas akun, pesanan, dan update penting lainnya.",
    },
    {
      icon: "🗺️",
      title: "Map Picker & Lokasi",
      description:
        "Tentukan lokasi toko dengan mudah menggunakan peta interaktif.",
    },
    {
      icon: "🌱",
      title: "Dampak Positif",
      description:
        "Berkontribusi pada pengurangan limbah fashion dan ekonomi circular",
    },
    {
      icon: "⚡",
      title: "Rental Cepat",
      description:
        "Proses sewa yang mudah dan instan, mitra dapat langsung menerima dan mengelola pesanan tanpa ribet.",
    },
    {
      icon: "⚖️",
      title: "Kuota Adil Donasi",
      description: "Sistem kuota yang memastikan distribusi donasi yang merata",
    },
    {
      icon: "📈",
      title: "Inventory Management",
      description:
        "Kelola koleksi fashion dengan sistem kategorisasi otomatis, tracking kondisi barang.",
    },
    {
      icon: "📊",
      title: "Pantau Aktivitas",
      description:
        "Monitor semua permintaan donasi dan sewa dengan dashboard real-time yang mudah dipahami",
    },
    {
      icon: "📱",
      title: "Akses Mobile",
      description:
        "Jangkau ribuan pengguna mobile yang mencari fashion berkelanjutan",
    },
    {
      icon: "🔍",
      title: "Filter & Search Canggih",
      description:
        "Cari item berdasarkan nama, ukuran, warna, harga, dan status dengan filter yang powerful",
    },
    {
      icon: "🔄",
      title: "Status Tracking Real-time",
      description:
        "Pantau status barang dari aktif, stok habis, hingga sedang disewa dengan update otomatis",
    },
    {
      icon: "👗",
      title: "Multi-Category Support",
      description:
        "Dukung berbagai kategori fashion dari atasan, bawahan, gaun, jas, hingga aksesoris dan kostum",
    },
    {
      icon: "📋",
      title: "Request Management",
      description:
        "Kelola permintaan donasi dan sewa dengan sistem approval, tracking tanggal, dan komunikasi terintegrasi",
    },
    {
      icon: "✨",
      title: "Tampilan Interaktif Modern",
      description:
        "Pengalaman pengguna lebih baik dengan dropdown, modal, dan UI/UX modern.",
    },
  ];

  const pricingPlans = [
    {
      title: "Starter",
      price: "Gratis",
      description: "Untuk mitra pemula",
      features: [
        "Hingga 50 item",
        "Dashboard dasar",
        "Support email",
        "Komisi 5%",
      ],
      buttonText: "Mulai Gratis",
      buttonColor: "bg-green-500",
      borderColor: "border-gray-200",
    },
    {
      title: "Professional",
      price: "Rp 99K",
      description: "Per bulan",
      features: [
        "Hingga 500 item",
        "Dashboard advanced",
        "Priority support",
        "Komisi 3%",
        "Analytics mendalam",
      ],
      buttonText: "Pilih Professional",
      buttonColor: "bg-blue-500",
      borderColor: "border-blue-500",
      isPopular: true,
    },
    {
      title: "Enterprise",
      price: "Custom",
      description: "Untuk bisnis besar",
      features: [
        "Unlimited items",
        "Custom dashboard",
        "Dedicated support",
        "Komisi 1%",
        "API access",
      ],
      buttonText: "Hubungi Sales",
      buttonColor: "bg-purple-500",
      borderColor: "border-gray-200",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                <span className="text-green-500">Satu</span>Lemari
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-black hover:text-green-500 transition-colors font-semibold"
                >
                  {link.label}
                </Link>
              ))}
              <div className="hidden lg:flex space-x-3 items-center">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsDownloadDropdownOpen(!isDownloadDropdownOpen)
                    }
                    className="flex items-center text-green-500 hover:text-green-600 transition-colors font-semibold border-green-500 border-2 px-6 py-2 cursor-pointer rounded-3xl"
                  >
                    Download App
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isDownloadDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                      >
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Download SatuLemari
                          </h3>

                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">📱</span>
                                <h4 className="font-semibold text-green-800">
                                  Untuk Pelanggan
                                </h4>
                              </div>
                              <p className="text-sm text-green-700 mb-3">
                                Sewa & terima donasi fashion berkelanjutan
                              </p>
                              <div className="flex space-x-2">
                                <a
                                  href="/app-release.apk"
                                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer text-center"
                                >
                                  Download
                                </a>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">💼</span>
                                <h4 className="font-semibold text-blue-800">
                                  Untuk Mitra
                                </h4>
                              </div>
                              <p className="text-sm text-blue-700 mb-3">
                                Kelola bisnis fashion rental Anda
                              </p>
                              <Link
                                href="/register"
                                className="block w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors text-center"
                                onClick={() => setIsDownloadDropdownOpen(false)}
                              >
                                Daftar Sekarang
                              </Link>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                              Aplikasi mobile akan segera tersedia di Appstore &
                              Google Play
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  href="/register"
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors font-semibold"
                >
                  Daftar Sebagai Mitra
                </Link>
              </div>
            </div>
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-black hover:text-green-500 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="block px-3 py-2 bg-green-500 text-white rounded-lg text-center font-semibold"
                >
                  Bergabung Sebagai Mitra
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Carousel Section */}
      <section id="home" className="relative overflow-hidden xl:min-h-screen">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentHeroSlide].bgGradient} transition-all duration-1000 ease-in-out`}
        />

        <div className="relative z-10 py-10 xl:py-0 xl:min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
              <div className="text-center lg:text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`badge-${currentHeroSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                      heroSlides[currentHeroSlide].accentColor === "green"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {heroSlides[currentHeroSlide].type === "partner"
                      ? "🌐 Platform Mitra"
                      : "📱 Aplikasi Mobile"}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.h1
                    key={`title-${currentHeroSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                  >
                    {heroSlides[currentHeroSlide].title}{" "}
                    <span
                      className={`${
                        heroSlides[currentHeroSlide].accentColor === "green"
                          ? "text-green-500"
                          : "text-blue-500"
                      }`}
                    >
                      {heroSlides[currentHeroSlide].subtitle}
                    </span>
                  </motion.h1>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={`desc-${currentHeroSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-xl text-gray-600 mb-8 leading-relaxed"
                  >
                    {heroSlides[currentHeroSlide].description}
                  </motion.p>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`buttons-${currentHeroSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  >
                    <Link
                      href={
                        heroSlides[currentHeroSlide].type === "partner"
                          ? heroSlides[currentHeroSlide].primaryLink
                          : "/app-release.apk"
                      }
                      className={`${
                        heroSlides[currentHeroSlide].accentColor === "green"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg`}
                    >
                      {heroSlides[currentHeroSlide].primaryCta}
                    </Link>
                    <Link
                      href={heroSlides[currentHeroSlide].secondaryLink}
                      className={`bg-white ${
                        heroSlides[currentHeroSlide].accentColor === "green"
                          ? "text-green-500 border-green-500 hover:bg-green-50"
                          : "text-blue-500 border-blue-500 hover:bg-blue-50"
                      } border-2 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300`}
                    >
                      {heroSlides[currentHeroSlide].secondaryCta}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative">
                <div className="bg-white rounded-3xl p-4 lg:p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence mode="wait">
                      {heroSlides[currentHeroSlide].features.map(
                        (item, index) => (
                          <motion.div
                            key={`feature-${currentHeroSlide}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.1,
                              ease: "easeOut",
                            }}
                            className={`${item.bg} rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300`}
                          >
                            <div className="text-3xl mb-2">{item.icon}</div>
                            <div
                              className={`text-sm font-semibold ${item.text}`}
                            >
                              {item.label}
                            </div>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentHeroSlide
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentHeroSlide(
              (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
            )
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() =>
            setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)
          }
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20"
        >
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </section>

      {/* Platform Ecosystem Overview */}
      <section className="py-20 bg-white" id="platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ekosistem Platform Lengkap
            </h2>
            <p
              data-aos="fade-up"
              data-aos-duration="1000"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Dua platform yang saling terhubung: Web untuk Mitra, Mobile untuk
              End User
            </p>
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="flex justify-center mb-12"
          >
            <div className="bg-gray-100 rounded-xl lg:rounded-full p-1">
              <button
                onClick={() => setActiveTab("partner")}
                className={`px-8 py-3 w-full lg:w-fit rounded-xl lg:rounded-full text-lg font-medium transition-all ${
                  activeTab === "partner"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🌐 Platform Mitra (Web)
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`px-8 py-3 w-full lg:w-fit rounded-xl lg:rounded-full text-lg font-medium transition-all ${
                  activeTab === "user"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📱 Aplikasi User (Mobile)
              </button>
            </div>
          </div>
          {activeTab === "partner" && (
            <div data-aos="fade-up" data-aos-duration="1000">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Platform Web untuk Mitra
                </h3>
                <p className="text-lg text-gray-600">
                  Dashboard lengkap untuk mengelola bisnis fashion berkelanjutan
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {partnerSteps.map((step, index) => (
                  <ProcessStep
                    key={index}
                    {...step}
                    bgColor="bg-green-200"
                    iconBg="bg-green-100"
                  />
                ))}
              </div>
            </div>
          )}
          {activeTab === "user" && (
            <div data-aos="fade-up" data-aos-duration="1000">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Aplikasi Mobile untuk End User
                </h3>
                <p className="text-lg text-gray-600">
                  Pengalaman seamless untuk sewa dan terima donasi fashion
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {userSteps.map((step, index) => (
                  <ProcessStep
                    key={index}
                    {...step}
                    bgColor="bg-blue-200"
                    iconBg="bg-blue-100"
                  />
                ))}
              </div>
            </div>
          )}
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Bagaimana Keduanya Terhubung?
              </h3>
              <p className="text-lg text-gray-600">
                Sinergi sempurna antara platform web dan mobile
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {[
                {
                  icon: "🌐",
                  color: "bg-green-500",
                  title: "Mitra Upload Item",
                  desc: "Mitra mengelola inventaris melalui dashboard web",
                },
                {
                  icon: "🔄",
                  color: "bg-purple-500",
                  title: "Sinkronisasi Real-time",
                  desc: "Item langsung tersedia di aplikasi mobile user",
                },
                {
                  icon: "📱",
                  color: "bg-blue-500",
                  title: "User Pesan Item",
                  desc: "User mobile dapat langsung menyewa atau request donasi",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <span className="text-2xl text-white">{item.icon}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Market Section */}
      <section
        className="py-20 bg-gradient-to-br from-purple-50 to-pink-50"
        id="users"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div
            data-aos="fade-right"
            data-aos-duration="1000"
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Siapa Saja yang Bisa Bergabung?
            </h2>
            <p className="text-xl text-gray-600">
              Platform terbuka untuk semua kalangan yang ingin berbagi fashion
              berkelanjutan
            </p>
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {userTypes.map((userType, index) => (
              <UserTypeCard key={index} {...userType} />
            ))}
          </div>
          <div data-aos="fade-up" data-aos-duration="1000" className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Untuk Bisnis Fashion
              </h3>
              <p className="text-lg text-gray-600">
                Solusi lengkap untuk mengembangkan bisnis fashion berkelanjutan
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="hidden md:flex w-16 h-16 bg-white bg-opacity-20 rounded-full items-center justify-center mr-4">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">
                      Butik, Toko Fashion & UMKM
                    </h4>
                    <p className="text-purple-100">
                      Perluas jangkauan bisnis dengan model rental
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    [
                      "Monetize koleksi existing dengan rental",
                      "Dashboard modern dan efisien",
                      "Pengaturan harga yang fleksibel",
                    ],
                    [
                      "Akses ke customer base yang lebih luas",
                      "Inventory management yang terintegrasi",
                      "Lokasi toko dengan peta interaktif",
                    ],
                  ].map((column, colIndex) => (
                    <ul key={colIndex} className="space-y-3">
                      {column.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center">
                          <span className="mr-3">✨</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Statistics */}
      <section
        id="impact-section"
        className="py-20 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dampak Positif Bersama
            </h2>
            <p className="text-xl text-gray-600">
              Bersama-sama kita ciptakan ekosistem fashion yang berkelanjutan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <StatCard
              value={partnersCount}
              label="Mitra Aktif"
              sublabel="Di seluruh Indonesia"
              color="text-green-600"
              delay={100}
            />
            <StatCard
              value={itemsListed}
              label="Pakaian Terdaftar"
              sublabel="Siap disewa & didonasikan"
              color="text-blue-600"
              delay={200}
            />
            <StatCard
              value={wasteReduced}
              label="Limbah Tekstil Dikurangi"
              sublabel="Kontribusi untuk bumi"
              color="text-purple-600"
              delay={300}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah Boutique",
                since: "2023",
                icon: "👩‍💼",
                bg: "bg-green-200",
                quote:
                  "Platform ini mengubah cara saya berbisnis fashion. Dalam 6 bulan, pendapatan dari rental meningkat 300% dan saya bisa berkontribusi pada lingkungan.",
                badges: ["+300% Revenue", "500+ Items"],
              },
              {
                name: "Andi Fashion Hub",
                since: "2022",
                icon: "👨‍💼",
                bg: "bg-blue-200",
                quote:
                  "Sebagai pionir fashion berkelanjutan, platform ini memberikan tools yang saya butuhkan untuk mengelola bisnis dengan efisien dan berdampak positif.",
                badges: ["1000+ Donasi"],
              },
            ].map((story, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay={(index + 1) * 100}
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-16 h-16 ${story.bg} rounded-full flex items-center justify-center mr-4`}
                  >
                    <span className="text-2xl">{story.icon}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {story.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Mitra sejak {story.since}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{story.quote}"</p>
                <div className="flex items-center gap-4 text-sm">
                  {story.badges.map((badge, badgeIndex) => (
                    <span
                      key={badgeIndex}
                      className={`${
                        badgeIndex === 0
                          ? "bg-green-100 text-green-700"
                          : badgeIndex === 1
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      } px-3 py-1 rounded-full`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div
            data-aos="fade-left"
            data-aos-duration="1000"
            className="text-center mb-16 overflow-hidden"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Keuntungan Menjadi Mitra
            </h2>
            <p className="text-xl text-gray-600">
              Platform lengkap untuk mengembangkan bisnis fashion berkelanjutan
              Anda
            </p>
          </div>
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section id="partnership" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pilih Paket Kemitraan
            </h2>
            <p className="text-xl text-gray-600">
              Mulai dari gratis hingga enterprise, pilih yang sesuai dengan
              kebutuhan bisnis Anda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                data-aos="zoom-in-up"
                data-aos-duration="1000"
                data-aos-delay="200"
              >
                <PricingCard {...plan} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Slider Section */}
      <section className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCtaSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`bg-gradient-to-r ${ctaSlides[currentCtaSlide].bgGradient} py-20`}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                  ctaSlides[currentCtaSlide].type === "partner"
                    ? "bg-green-200 text-green-800"
                    : "bg-blue-200 text-blue-800"
                }`}
              >
                {ctaSlides[currentCtaSlide].type === "partner"
                  ? "🌐 Untuk Mitra"
                  : "📱 Untuk Pengguna Mobile"}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-black mb-6"
              >
                {ctaSlides[currentCtaSlide].title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-800 mb-8"
              >
                {ctaSlides[currentCtaSlide].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Link
                  href={
                    ctaSlides[currentCtaSlide].type === "partner"
                      ? ctaSlides[currentCtaSlide].link
                      : "/app-release.apk"
                  }
                  className={`${ctaSlides[currentCtaSlide].buttonColor} text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg`}
                >
                  {ctaSlides[currentCtaSlide].cta}
                </Link>
              </motion.div>

              {/* Additional features for current slide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
              >
                {ctaSlides[currentCtaSlide].type === "partner" ? (
                  <>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-3">💰</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Raih Keuntungan
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Monetize koleksi fashion dengan model rental
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-3">🌱</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Dampak Positif
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Berkontribusi pada fashion berkelanjutan
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-3">🚀</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Mudah Digunakan
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Dashboard modern dan user-friendly
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-3">👗</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Fashion Berkualitas
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Ribuan pilihan fashion untuk disewa
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-3">🎁</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Donasi Gratis
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Dapatkan fashion gratis dari komunitas
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-3">💝</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Komunitas
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Bergabung dengan fashion enthusiast
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {ctaSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCtaSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentCtaSlide
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 SatuLemari
        </div>
      </footer>
    </div>
  );
}

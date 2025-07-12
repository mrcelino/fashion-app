import { NextResponse } from 'next/server';

// Data palsu sesuai kontrak API (10 item)
const mockProducts = [
  // 5 Data Donasi (tanpa `price`)
  {
    id: 1,
    name: "Kemeja Flanel Kotak-kotak",
    type: "donasi",
    description: "Kemeja flanel tebal dan nyaman, cocok untuk cuaca dingin.",
    category: "Atasan",
    size: "L",
    color: "Merah-Hitam",
    quantity: 5,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 2,
    name: "Kaos Polos Katun",
    type: "donasi",
    description: "Kaos polos bahan katun combed 30s, adem dan menyerap keringat.",
    category: "Atasan",
    size: "M",
    color: "Putih",
    quantity: 10,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 3,
    name: "Celana Training Parasut",
    type: "donasi",
    description: "Celana training ringan untuk olahraga atau kegiatan santai.",
    category: "Bawahan",
    size: "XL",
    color: "Hitam",
    quantity: 3,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 4,
    name: "Hoodie Jumper",
    type: "donasi",
    description: "Hoodie tebal dengan kantong depan, menjaga tetap hangat.",
    category: "Jaket",
    size: "L",
    color: "Abu-abu",
    quantity: 8,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 5,
    name: "Topi Baseball",
    type: "donasi",
    description: "Topi baseball dengan logo simpel di bagian depan.",
    category: "Aksesoris",
    size: "All Size",
    color: "Biru Dongker",
    quantity: 12,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  // 5 Data Sewa (dengan `price`)
  {
    id: 6,
    name: "Gaun Pesta Elegan",
    type: "sewa",
    price: 250000,
    description: "Gaun malam panjang yang cocok untuk acara formal dan pesta.",
    category: "Gaun",
    size: "M",
    color: "Maroon",
    quantity: 2,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 7,
    name: "Jas Formal Pria",
    type: "sewa",
    price: 300000,
    description: "Setelan jas lengkap untuk pernikahan atau acara bisnis.",
    category: "Jas",
    size: "L",
    color: "Hitam",
    quantity: 3,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 8,
    name: "Kebaya Modern Wisuda",
    type: "sewa",
    price: 200000,
    description: "Kebaya modern dengan detail payet, cocok untuk wisuda atau lamaran.",
    category: "Kebaya",
    size: "S",
    color: "Pink Pastel",
    quantity: 4,
    status: "rented",
    imageUrl: "/shirt.webp"
  },
  {
    id: 9,
    name: "Kostum Superhero Anak",
    type: "sewa",
    price: 150000,
    description: "Kostum superhero lengkap dengan topeng untuk pesta ulang tahun anak.",
    category: "Kostum",
    size: "Anak",
    color: "Merah-Biru",
    quantity: 1,
    status: "available",
    imageUrl: "/shirt.webp"
  },
  {
    id: 10,
    name: "Beskap Jawa Klasik",
    type: "sewa",
    price: 275000,
    description: "Beskap adat Jawa lengkap dengan blangkon dan keris.",
    category: "Adat",
    size: "XL",
    color: "Coklat Tua",
    quantity: 2,
    status: "available",
    imageUrl: "/shirt.webp"
  },
];

// Handler untuk method GET
export async function GET(request: Request) {
  // Ambil URL dan search parameters dari request yang masuk
  const { searchParams } = new URL(request.url);
  // Dapatkan nilai dari parameter 'type'
  const type = searchParams.get('type');

  // Simulasi loading/delay dari server asli
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Jika ada parameter 'type' (misal: 'sewa' atau 'donasi')
  if (type) {
    // Filter data berdasarkan tipe yang diminta
    const filteredProducts = mockProducts.filter(product => product.type === type);
    // Kembalikan data yang sudah difilter
    return NextResponse.json(filteredProducts);
  }
  
  // Jika tidak ada parameter 'type', kembalikan semua data
  return NextResponse.json(mockProducts);
}
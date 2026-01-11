'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MasterKiriman {
  id: number;
  nama_kiriman: string;
}

export default function HomePage() {
  const router = useRouter();
  const [listKiriman, setListKiriman] = useState<MasterKiriman[]>([]);
  const [namaKiriman, setNamaKiriman] = useState('');
  const [namaKirimanCustom, setNamaKirimanCustom] = useState('');
  const [nomerPo, setNomerPo] = useState('');
  const [precisionMode, setPrecisionMode] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMasterKiriman();
  }, []);

  const fetchMasterKiriman = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/master-kiriman');
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error('Backend not available');
      }
      
      const data = await res.json();
      setListKiriman(data);
      console.log('✅ Connected to backend!');
    } catch (error) {
      console.log('⚠️ Backend belum jalan, pake data fallback');
      // Fallback data jika backend belum jalan
      setListKiriman([
        { id: 1, nama_kiriman: 'Aceh' },
        { id: 2, nama_kiriman: 'Ambon' },
        { id: 3, nama_kiriman: 'Bangka' },
        { id: 4, nama_kiriman: 'Banjarmasin' },
        { id: 5, nama_kiriman: 'Batam' },
        { id: 6, nama_kiriman: 'Belitung' },
        { id: 7, nama_kiriman: 'Bengkulu' },
        { id: 8, nama_kiriman: 'Bima' },
        { id: 9, nama_kiriman: 'Bintan' },
        { id: 10, nama_kiriman: 'CGL' },
        { id: 11, nama_kiriman: 'CPI' },
        { id: 12, nama_kiriman: 'CBN 1' },
        { id: 13, nama_kiriman: 'Bangkit' },
        { id: 14, nama_kiriman: 'Ende' },
        { id: 15, nama_kiriman: 'Flores' },
        { id: 16, nama_kiriman: 'Gorontalo' },
        { id: 17, nama_kiriman: 'Jambi' },
        { id: 18, nama_kiriman: 'Jayapura' },
        { id: 19, nama_kiriman: 'Kendari' },
        { id: 20, nama_kiriman: 'Kupang' },
        { id: 21, nama_kiriman: 'Lampung' },
        { id: 22, nama_kiriman: 'Lombok' },
        { id: 23, nama_kiriman: 'Manado' },
        { id: 24, nama_kiriman: 'Manokwari' },
        { id: 25, nama_kiriman: 'Palembang' },
        { id: 26, nama_kiriman: 'Pekanbaru' },
        { id: 27, nama_kiriman: 'Pontianak' },
        { id: 28, nama_kiriman: 'Samarinda' },
        { id: 29, nama_kiriman: 'Sikka' },
        { id: 30, nama_kiriman: 'Sorong' },
        { id: 31, nama_kiriman: 'Sumba' },
        { id: 32, nama_kiriman: 'Ternate' },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalNamaKiriman = namaKirimanCustom.trim() || namaKiriman;
    
    if (!finalNamaKiriman || !nomerPo.trim()) {
      alert('Nama kiriman dan Nomor PO harus diisi!');
      return;
    }

    setLoading(true);

    try {
      sessionStorage.setItem('current_shipment', JSON.stringify({
        nama_kiriman: finalNamaKiriman,
        nomer_po: nomerPo.trim(),
        precision_mode: precisionMode
      }));

      router.push('/input');
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-900 mb-3">📦 Input Kiriman Ayam</h1>
          <p className="text-gray-600">Sistem input data berat ayam modern & efisien</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                📦 Nama Kiriman
              </label>
              <select
                value={namaKiriman}
                onChange={(e) => {
                  setNamaKiriman(e.target.value);
                  if (e.target.value) setNamaKirimanCustom('');
                }}
                disabled={!!namaKirimanCustom}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition disabled:bg-gray-100 text-gray-900"
              >
                <option value="" className="text-gray-500">-- Pilih Nama Kiriman --</option>
                {listKiriman.map((item) => (
                  <option key={item.id} value={item.nama_kiriman}>
                    {item.nama_kiriman}
                  </option>
                ))}
              </select>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">atau</span>
                </div>
              </div>

              <input
                type="text"
                value={namaKirimanCustom}
                onChange={(e) => {
                  setNamaKirimanCustom(e.target.value);
                  if (e.target.value) setNamaKiriman('');
                }}
                disabled={!!namaKiriman}
                placeholder="Ketik nama kiriman baru"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
              />
              <small className="text-gray-500 text-xs mt-1 block">
                💡 Pilih dari dropdown atau ketik nama baru
              </small>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                📄 Nomor PO
              </label>
              <input
                type="text"
                value={nomerPo}
                onChange={(e) => setNomerPo(e.target.value)}
                placeholder="Contoh: PO-001"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                🎯 Mode Presisi Desimal
              </label>
              <select
                value={precisionMode}
                onChange={(e) => setPrecisionMode(parseInt(e.target.value))}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition text-gray-900"
              >
                <option value={1}>1 Angka Dibelakang Koma (4,0 - 6,0)</option>
                <option value={2}>2 Angka Dibelakang Koma (4,00 - 6,00)</option>
              </select>
              <small className="text-gray-500 text-xs mt-1 block">
                💡 Mode 1: Grid Button | Mode 2: Scrollable Picker
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Loading...' : '➡️ Lanjut Input Data'}
            </button>

            <a
              href="/riwayat"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 rounded-xl transition text-center"
            >
              📊 Lihat Riwayat Input
            </a>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center border border-gray-100">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm font-semibold text-gray-700">Cepat</div>
            <div className="text-xs text-gray-500">Input data kilat</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center border border-gray-100">
            <div className="text-3xl mb-2">💾</div>
            <div className="text-sm font-semibold text-gray-700">Auto-Save</div>
            <div className="text-xs text-gray-500">Data aman tersimpan</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center border border-gray-100">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm font-semibold text-gray-700">Export Excel</div>
            <div className="text-xs text-gray-500">Langsung ke Excel</div>
          </div>
        </div>
      </div>
    </div>
  );
}

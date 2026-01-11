'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RiwayatData {
  id: number;
  nama_kiriman: string;
  nomer_po: string;
  data_input: string;
  total_data: number;
  rata_rata: number | string;
  nilai_max: number | string;
  nilai_min: number | string;
  created_at: string;
}

export default function RiwayatPage() {
  const router = useRouter();
  const [riwayatList, setRiwayatList] = useState<RiwayatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKiriman, setFilterKiriman] = useState('');
  const [filterPo, setFilterPo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listKiriman, setListKiriman] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchRiwayat();
    fetchListKiriman();
  }, [page, filterKiriman, filterPo]);

  const fetchListKiriman = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/master-kiriman');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const names = data.map((item: any) => item.nama_kiriman);
      setListKiriman(names);
    } catch (error) {
      console.error('Error fetching kiriman list:', error);
    }
  };

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/riwayat');
      if (!res.ok) throw new Error('Failed to fetch');
      let data = await res.json();

      // Filter berdasarkan kriteria
      if (filterKiriman) {
        data = data.filter((item: RiwayatData) =>
          item.nama_kiriman.toLowerCase().includes(filterKiriman.toLowerCase())
        );
      }

      if (filterPo) {
        data = data.filter((item: RiwayatData) =>
          item.nomer_po.toLowerCase().includes(filterPo.toLowerCase())
        );
      }

      // Hitung pagination
      const totalItems = data.length;
      const pages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      setTotalPages(pages);

      // Pagination
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const paginatedData = data.slice(startIdx, startIdx + ITEMS_PER_PAGE);

      setRiwayatList(paginatedData);
    } catch (error) {
      console.error('Error fetching riwayat:', error);
      setRiwayatList([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (dataInput: string) => {
    const values = dataInput.split(',').map(v => parseFloat(v));
    const accepted = values.filter(v => v >= 4.8 && v < 5.4).length;
    const rejected = values.length - accepted;
    const sum = values.reduce((a, b) => a + b, 0);
    const acceptanceRate = values.length > 0 ? ((accepted / values.length) * 100).toFixed(1) : 0;
    
    return { accepted, rejected, sum, acceptanceRate, values };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">📊 Riwayat Input Kiriman</h1>
            <p className="text-gray-600">Lihat semua data input yang telah disimpan</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            ➕ Input Baru
          </button>
        </div>

        {/* Filter Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🔍 Filter Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kiriman</label>
              <select
                value={filterKiriman}
                onChange={(e) => {
                  setFilterKiriman(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-gray-900"
              >
                <option value="">-- Semua Kiriman --</option>
                {listKiriman.map((kiriman) => (
                  <option key={kiriman} value={kiriman}>
                    {kiriman}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor PO</label>
              <input
                type="text"
                value={filterPo}
                onChange={(e) => {
                  setFilterPo(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari Nomor PO"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setFilterKiriman('');
                  setFilterPo('');
                  setPage(1);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table or Loading */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading riwayat...</p>
          </div>
        ) : riwayatList.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum ada riwayat</h2>
            <p className="text-gray-600 mb-6">Mulai dengan membuat input data baru</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition"
            >
              ➡️ Input Data Sekarang
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {riwayatList.map((item, idx) => {
                      const stats = calculateStats(item.data_input);
                      const no = (page - 1) * ITEMS_PER_PAGE + idx + 1;

                      return (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{no}</td>
                          <td className="px-4 py-3 text-sm font-bold text-indigo-900">{item.nama_kiriman}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.nomer_po}</td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{item.total_data}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                              ✓ {stats.accepted}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                              ✗ {stats.rejected}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-green-600">{stats.acceptanceRate}%</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">{stats.sum.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-center text-red-600 font-semibold">
                            {parseFloat(item.nilai_max as any).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-blue-600 font-semibold">
                            {parseFloat(item.nilai_min as any).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => router.push(`/riwayat/${item.id}`)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded text-xs transition"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700 font-semibold">
                  Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg text-sm transition"
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg text-sm transition"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        p === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg text-sm transition"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg text-sm transition"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

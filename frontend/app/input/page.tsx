'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface ShipmentData {
  nama_kiriman: string;
  nomer_po: string;
  precision_mode: number;
}

export default function InputPage() {
  const router = useRouter();
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [weights, setWeights] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [currentWhole, setCurrentWhole] = useState(5);
  const [currentDecimal, setCurrentDecimal] = useState(0);
  const wholePickerRef = useRef<HTMLDivElement>(null);
  const decimalPickerRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = `chicken_input_data`;
  const META_KEY = `chicken_input_meta`;

  useEffect(() => {
    const savedShipment = sessionStorage.getItem('current_shipment');
    if (!savedShipment) {
      router.push('/');
      return;
    }
    
    const data: ShipmentData = JSON.parse(savedShipment);
    setShipmentData(data);
    checkRecovery(data);

    if (data.precision_mode === 2) {
      setTimeout(initializePicker, 100);
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (weights.length > 0 && !loading) {
        e.preventDefault();
        e.returnValue = 'Data belum di-export! Yakin mau keluar?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (weights.length > 0 && shipmentData) {
      saveToLocalStorage();
    }
  }, [weights]);

  const checkRecovery = (data: ShipmentData) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const meta = localStorage.getItem(META_KEY);
      
      if (saved && meta) {
        const savedWeights = JSON.parse(saved);
        const savedMeta = JSON.parse(meta);
        
        if (savedMeta.nomer_po === data.nomer_po && savedWeights.length > 0) {
          if (confirm(`Ditemukan ${savedWeights.length} data belum di-export. Lanjutkan data ini?`)) {
            setWeights(savedWeights);
          } else {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(META_KEY);
          }
        }
      }
    } catch (error) {
      console.error('Recovery error:', error);
    }
  };

  const saveToLocalStorage = () => {
    if (!shipmentData) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
      localStorage.setItem(META_KEY, JSON.stringify({
        ...shipmentData,
        last_update: new Date().toISOString(),
        total_clicks: weights.length
      }));
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const addWeight = (weight: number) => {
    if (!shipmentData) return;
    const decimals = shipmentData.precision_mode;
    setWeights([...weights, parseFloat(weight.toFixed(decimals))]);
  };

  const deleteLastWeight = () => {
    setWeights(weights.slice(0, -1));
  };

  const deleteAllWeights = () => {
    if (confirm('Yakin mau hapus semua data?')) {
      setWeights([]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(META_KEY);
    }
  };

  const exportToExcel = async () => {
    if (!shipmentData || weights.length === 0) return;

    setLoading(true);

    try {
      const chunkSize = 20;
      const rows = [];
      
      rows.push([
        'Nama Kiriman',
        'Nomor PO',
        ...Array(chunkSize).fill('').map((_, i) => `Berat ${i + 1}`)
      ]);

      for (let i = 0; i < weights.length; i += chunkSize) {
        const chunk = weights.slice(i, i + chunkSize);
        const row = [
          i === 0 ? shipmentData.nama_kiriman : '',
          i === 0 ? shipmentData.nomer_po : '',
          ...chunk,
          ...Array(chunkSize - chunk.length).fill('')
        ];
        rows.push(row);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Ayam');
      XLSX.writeFile(wb, `Kiriman_${shipmentData.nama_kiriman}_${Date.now()}.xlsx`);

      try {
        await fetch('http://localhost:3001/api/riwayat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_kiriman: shipmentData.nama_kiriman,
            nomer_po: shipmentData.nomer_po,
            precision_mode: shipmentData.precision_mode,
            weights: weights
          })
        });
      } catch (apiError) {
        console.log('Backend belum jalan, data hanya di-export ke Excel');
      }

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(META_KEY);

      alert('✅ Data berhasil di-export ke Excel!');
      router.push('/');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Gagal export data!');
    } finally {
      setLoading(false);
    }
  };

  const initializePicker = () => {
    const wholePicker = wholePickerRef.current;
    const decimalPicker = decimalPickerRef.current;

    if (wholePicker) {
      wholePicker.addEventListener('scroll', () => handlePickerScroll('whole'));
      centerPickerItem(wholePicker, 3);
    }

    if (decimalPicker) {
      decimalPicker.addEventListener('scroll', () => handlePickerScroll('decimal'));
      centerPickerItem(decimalPicker, 2);
    }
  };

  const handlePickerScroll = (type: 'whole' | 'decimal') => {
    const picker = type === 'whole' ? wholePickerRef.current : decimalPickerRef.current;
    if (!picker) return;

    const items: Element[] = Array.from(picker.querySelectorAll('.picker-item:not(.picker-dummy)'));
    const pickerRect = picker.getBoundingClientRect();
    const centerY = pickerRect.top + pickerRect.height / 2;

    let closest: { item: Element; distance: number } | null = null;

    items.forEach((item: Element) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;
      const distance = Math.abs(itemCenter - centerY);

      if (!closest || distance < closest.distance) {
        closest = { item, distance };
      }
    });

    if (closest) {
      items.forEach((item: Element) => item.classList.remove('active'));
      closest.item.classList.add('active');
      
      const value = parseInt(closest.item.getAttribute('data-value') || '0');
      if (type === 'whole') {
        setCurrentWhole(value);
      } else {
        setCurrentDecimal(value);
      }
    }
  };

  const centerPickerItem = (picker: HTMLDivElement, index: number) => {
    const items = Array.from(picker.querySelectorAll('.picker-item'));
    if (items[index]) {
      const item = items[index] as HTMLElement;
      const scrollOffset = item.offsetTop - picker.clientHeight / 2 + item.clientHeight / 2;
      picker.scrollTo({ top: scrollOffset, behavior: 'smooth' });
    }
  };

  const confirmPickerSelection = () => {
    const value = currentWhole + (currentDecimal / 100);
    if (value >= 4.0 && value <= 6.0) {
      addWeight(value);
    } else {
      alert('Nilai harus antara 4,00 - 6,00');
    }
  };

  if (!shipmentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const numberButtons = [];
  for (let i = 40; i <= 60; i++) {
    numberButtons.push(i / 10);
  }

  const getLastWeight = () => weights.length > 0 ? weights[weights.length - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nama Kiriman</p>
              <p className="text-xl font-bold text-indigo-900">{shipmentData.nama_kiriman}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Nomor PO</p>
              <p className="text-xl font-bold text-indigo-900">{shipmentData.nomer_po}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Mode</p>
              <p className="text-lg font-semibold text-purple-700">
                {shipmentData.precision_mode === 2 ? '2 Desimal' : '1 Desimal'}
              </p>
            </div>
          </div>
        </div>

        {getLastWeight() !== null && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl shadow-xl p-6 mb-6 border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Angka Terakhir Input</p>
                <p className="text-4xl font-bold text-green-900">
                  {getLastWeight()?.toFixed(shipmentData.precision_mode).replace('.', ',')} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700 mb-1">Total Data</p>
                <p className="text-4xl font-bold text-green-900">{weights.length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={deleteLastWeight}
            disabled={weights.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition shadow-lg"
          >
            🗑️ Hapus Terakhir
          </button>
          <button
            onClick={deleteAllWeights}
            disabled={weights.length === 0}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition shadow-lg"
          >
            ❌ Hapus Semua
          </button>
          <button
            onClick={exportToExcel}
            disabled={weights.length === 0 || loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition shadow-lg"
          >
            {loading ? '⏳ Loading...' : '📊 Export Excel'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 rounded-2xl transition shadow-lg"
          >
            🏠 Kembali
          </button>
        </div>

        {shipmentData.precision_mode === 1 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border border-gray-100">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">Pilih Berat (kg)</h3>
            <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
              {numberButtons.map((num) => (
                <button
                  key={num}
                  onClick={() => addWeight(num)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-2 rounded-xl transition transform hover:scale-105 active:scale-95 shadow-md text-sm md:text-base"
                >
                  {num.toFixed(1).replace('.', ',')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border border-gray-100">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">Pilih Berat (kg)</h3>
            <div className="relative h-64 overflow-hidden bg-gray-50 rounded-2xl">
              <div className="flex items-center justify-center h-full gap-2">
                <div 
                  ref={wholePickerRef}
                  className="h-full overflow-y-scroll snap-y snap-mandatory w-20 scrollbar-hide relative z-10"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div className="h-24"></div>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div
                      key={num}
                      data-value={num}
                      className="picker-item h-12 flex items-center justify-center text-2xl font-bold text-gray-600 snap-center transition-all duration-200"
                    >
                      {num}
                    </div>
                  ))}
                  <div className="h-24"></div>
                </div>

                <span className="text-3xl font-bold text-gray-700">,</span>

                <div 
                  ref={decimalPickerRef}
                  className="h-full overflow-y-scroll snap-y snap-mandatory w-20 scrollbar-hide relative z-10"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div className="h-24"></div>
                  {Array.from({ length: 100 }, (_, i) => i).map((num) => (
                    <div
                      key={num}
                      data-value={num}
                      className="picker-item h-12 flex items-center justify-center text-2xl font-bold text-gray-600 snap-center transition-all duration-200"
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                  <div className="h-24"></div>
                </div>
              </div>

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                <div className="w-full h-12 border-y-2 border-indigo-500 bg-indigo-50 bg-opacity-10"></div>
              </div>
            </div>

            <button
              onClick={confirmPickerSelection}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition shadow-lg"
            >
              ✅ Pilih {currentWhole},{String(currentDecimal).padStart(2, '0')} kg
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
          <h3 className="text-2xl font-bold text-indigo-900 mb-4">
            Data Input ({weights.length})
          </h3>
          {weights.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada data. Mulai input sekarang!</p>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
              {weights.map((w, idx) => (
                <div key={idx} className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-200">
                  <div className="text-xs text-indigo-600 font-semibold mb-1">#{idx + 1}</div>
                  <div className="text-lg font-bold text-indigo-900">
                    {w.toFixed(shipmentData.precision_mode).replace('.', ',')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .picker-item.active {
          color: #fff;
          background-color: #4F46E5;
          transform: scale(1.1);
          font-weight: bold;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

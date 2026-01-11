'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ExcelJS from 'exceljs';

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

export default function DetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RiwayatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataArray, setDataArray] = useState<number[]>([]);
  const [stats, setStats] = useState({
    sum: 0,
    accepted: 0,
    rejected: 0,
    acceptanceRate: 0
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/riwayat');
      if (!res.ok) throw new Error('Failed to fetch');
      
      const allData = await res.json();
      const item = allData.find((r: RiwayatData) => r.id === parseInt(id));

      if (!item) {
        setError('Data tidak ditemukan');
        setLoading(false);
        return;
      }

      setData(item);

      // Parse data array
      const arr = item.data_input.split(',').map((v: string) => parseFloat(v));
      setDataArray(arr);

      // Calculate stats
      const sum = arr.reduce((a: number, b: number) => a + b, 0);
      const accepted = arr.filter((v: number) => v >= 4.8 && v < 5.4).length;
      const rejected = arr.length - accepted;
      const acceptanceRate = arr.length > 0 ? ((accepted / arr.length) * 100) : 0;

      setStats({
        sum,
        accepted,
        rejected,
        acceptanceRate
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
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

  const handleDownloadExcel = async () => {
    if (!data) return;

    try {
      const workbook = new ExcelJS.Workbook();

      // ===== SHEET 1: DATA KIRIMAN =====
      const sheet1 = workbook.addWorksheet('Data Kiriman');

      // Header styling
      const headerStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF4CAF50' } },
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 },
        alignment: { horizontal: 'center' as const, vertical: 'center' as const }
      } as any;

      const subHeaderStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE3F2FD' } },
        font: { bold: true },
        alignment: { horizontal: 'center' as const }
      } as any;

      const titleStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF2196F3' } },
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { horizontal: 'center' as const }
      } as any;

      const statsStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFF9800' } },
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { horizontal: 'center' as const }
      } as any;

      const rejectedStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFCCCC' } },
        alignment: { horizontal: 'center' as const }
      } as any;

      const normalStyle = {
        alignment: { horizontal: 'center' as const }
      } as any;

      // Row 1: Main Header
      sheet1.mergeCells('A1:T1');
      const headerRow = sheet1.getCell('A1');
      headerRow.value = 'DATA KIRIMAN AYAM';
      headerRow.style = headerStyle;
      sheet1.getRow(1).height = 25;

      // Row 2: Sub Header
      sheet1.mergeCells('A2:J2');
      sheet1.mergeCells('K2:T2');
      const subHeader1 = sheet1.getCell('A2');
      const subHeader2 = sheet1.getCell('K2');
      subHeader1.value = 'Nama Kiriman';
      subHeader2.value = 'Nomor PO';
      subHeader1.style = subHeaderStyle;
      subHeader2.style = subHeaderStyle;

      // Row 3: Data
      sheet1.mergeCells('A3:J3');
      sheet1.mergeCells('K3:T3');
      sheet1.getCell('A3').value = data.nama_kiriman;
      sheet1.getCell('K3').value = data.nomer_po;

      // Row 4: Tanggal Header
      sheet1.mergeCells('A4:T4');
      const dateHeaderCell = sheet1.getCell('A4');
      dateHeaderCell.value = 'Tanggal Input';
      dateHeaderCell.style = subHeaderStyle;

      // Row 5: Tanggal
      sheet1.mergeCells('A5:T5');
      sheet1.getCell('A5').value = formatDate(data.created_at);

      // Row 6: Empty
      sheet1.getRow(6).height = 5;

      // Row 7: Data Title
      sheet1.mergeCells('A7:T7');
      const dataHeaderCell = sheet1.getCell('A7');
      dataHeaderCell.value = 'DATA INPUT (Merah = REJECT)';
      dataHeaderCell.style = titleStyle;
      sheet1.getRow(7).height = 20;

      // Data rows (20 kolom)
      let currentRow = 8;
      const chunks = [];
      for (let i = 0; i < dataArray.length; i += 20) {
        chunks.push(dataArray.slice(i, i + 20));
      }

      chunks.forEach((chunk) => {
        for (let col = 0; col < 20; col++) {
          const cell = sheet1.getCell(currentRow, col + 1);
          if (col < chunk.length) {
            const value = chunk[col];
            cell.value = value;
            const isRejected = value < 4.8 || value >= 5.4;
            cell.style = isRejected ? rejectedStyle : normalStyle;
          }
        }
        currentRow++;
      });

      // Empty row
      currentRow++;

      // Stats
      const statRows = [
        ['Total Data', data.total_data],
        ['Jumlah (Sum)', stats.sum.toFixed(2)],
        ['Rata-rata', parseFloat(data.rata_rata as any).toFixed(2)],
        ['Nilai Tertinggi', parseFloat(data.nilai_max as any).toFixed(1)],
        ['Nilai Terendah', parseFloat(data.nilai_min as any).toFixed(1)]
      ];

      statRows.forEach((stat) => {
        sheet1.mergeCells(`A${currentRow}:E${currentRow}`);
        sheet1.mergeCells(`F${currentRow}:T${currentRow}`);
        const labelCell = sheet1.getCell(`A${currentRow}`);
        const valueCell = sheet1.getCell(`F${currentRow}`);
        labelCell.value = stat[0];
        valueCell.value = stat[1];
        labelCell.style = statsStyle;
        valueCell.style = { alignment: { horizontal: 'center' } };
        currentRow++;
      });

      // ===== SHEET 2: DATA REJECTED =====
      const sheet2 = workbook.addWorksheet('Data Rejected');

      const rejectedHeaderStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF44336' } },
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 },
        alignment: { horizontal: 'center' as const, vertical: 'center' as const }
      } as any;

      const rejectedSubHeaderStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFE0E0' } },
        font: { bold: true },
        alignment: { horizontal: 'center' as const }
      } as any;

      const rejectedStatsStyle = {
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFF6F00' } },
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { horizontal: 'center' as const }
      } as any;

      // Row 1: Main Header
      sheet2.mergeCells('A1:T1');
      const rejHeaderRow = sheet2.getCell('A1');
      rejHeaderRow.value = '✗ DATA REJECTED (<4.8 atau ≥5.4)';
      rejHeaderRow.style = rejectedHeaderStyle;
      sheet2.getRow(1).height = 25;

      // Row 2: Sub Header
      sheet2.mergeCells('A2:J2');
      sheet2.mergeCells('K2:T2');
      const rejSubHeader1 = sheet2.getCell('A2');
      const rejSubHeader2 = sheet2.getCell('K2');
      rejSubHeader1.value = 'Nama Kiriman';
      rejSubHeader2.value = 'Nomor PO';
      rejSubHeader1.style = rejectedSubHeaderStyle;
      rejSubHeader2.style = rejectedSubHeaderStyle;

      // Row 3: Data
      sheet2.mergeCells('A3:J3');
      sheet2.mergeCells('K3:T3');
      sheet2.getCell('A3').value = data.nama_kiriman;
      sheet2.getCell('K3').value = data.nomer_po;

      // Row 4: Tanggal Header
      sheet2.mergeCells('A4:T4');
      const rejDateHeaderCell = sheet2.getCell('A4');
      rejDateHeaderCell.value = 'Tanggal Input';
      rejDateHeaderCell.style = rejectedSubHeaderStyle;

      // Row 5: Tanggal
      sheet2.mergeCells('A5:T5');
      sheet2.getCell('A5').value = formatDate(data.created_at);

      // Row 6: Empty
      sheet2.getRow(6).height = 5;

      // Row 7: Data Title
      sheet2.mergeCells('A7:T7');
      const rejDataHeaderCell = sheet2.getCell('A7');
      rejDataHeaderCell.value = 'DATA INPUT DITOLAK';
      rejDataHeaderCell.style = titleStyle;
      sheet2.getRow(7).height = 20;

      // Rejected data rows
      const rejectedData = dataArray.filter(v => v < 4.8 || v >= 5.4);
      let rejCurrentRow = 8;

      const rejChunks = [];
      for (let i = 0; i < rejectedData.length; i += 20) {
        rejChunks.push(rejectedData.slice(i, i + 20));
      }

      if (rejectedData.length > 0) {
        rejChunks.forEach((chunk) => {
          for (let col = 0; col < 20; col++) {
            const cell = sheet2.getCell(rejCurrentRow, col + 1);
            if (col < chunk.length) {
              cell.value = chunk[col];
              cell.style = normalStyle;
            }
          }
          rejCurrentRow++;
        });
      } else {
        sheet2.mergeCells(`A${rejCurrentRow}:T${rejCurrentRow}`);
        const noDataCell = sheet2.getCell(`A${rejCurrentRow}`);
        noDataCell.value = 'Tidak ada data yang ditolak';
        noDataCell.style = { alignment: { horizontal: 'center' }, font: { italic: true } };
        rejCurrentRow++;
      }

      // Empty row
      rejCurrentRow++;

      // Rejected Stats
      const rejectedSum = rejectedData.reduce((a, b) => a + b, 0);
      const rejectedAvg = rejectedData.length > 0 ? rejectedSum / rejectedData.length : 0;
      const rejectedMax = rejectedData.length > 0 ? Math.max(...rejectedData) : 0;
      const rejectedMin = rejectedData.length > 0 ? Math.min(...rejectedData) : 0;

      const rejStatRows = [
        ['Total Data', rejectedData.length],
        ['Jumlah (Sum)', rejectedData.length > 0 ? rejectedSum.toFixed(2) : '0.00'],
        ['Rata-rata', rejectedData.length > 0 ? rejectedAvg.toFixed(2) : '0.00'],
        ['Nilai Tertinggi', rejectedData.length > 0 ? rejectedMax.toFixed(1) : '0'],
        ['Nilai Terendah', rejectedData.length > 0 ? rejectedMin.toFixed(1) : '0']
      ];

      rejStatRows.forEach((stat) => {
        sheet2.mergeCells(`A${rejCurrentRow}:E${rejCurrentRow}`);
        sheet2.mergeCells(`F${rejCurrentRow}:T${rejCurrentRow}`);
        const labelCell = sheet2.getCell(`A${rejCurrentRow}`);
        const valueCell = sheet2.getCell(`F${rejCurrentRow}`);
        labelCell.value = stat[0];
        valueCell.value = stat[1];
        labelCell.style = rejectedStatsStyle;
        valueCell.style = { alignment: { horizontal: 'center' } };
        rejCurrentRow++;
      });

      // Set column widths
      for (let i = 1; i <= 20; i++) {
        sheet1.getColumn(i).width = 8;
        sheet2.getColumn(i).width = 8;
      }

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Detail_${data.nama_kiriman}_${data.nomer_po}_${Date.now()}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      // Navigate to download complete
      setTimeout(() => {
        router.push('/download-complete');
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export Excel!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading detail...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-red-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">{error || 'Data tidak ditemukan'}</h2>
            <p className="text-gray-600 mb-6">Kembali ke halaman riwayat</p>
            <button
              onClick={() => router.push('/riwayat')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition"
            >
              ← Kembali ke Riwayat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-indigo-900 mb-2">📋 {data.nama_kiriman}</h1>
              <p className="text-xl text-gray-600 mb-2">PO: <strong>{data.nomer_po}</strong></p>
              <p className="text-sm text-gray-500">Tanggal: {formatDate(data.created_at)}</p>
            </div>
            <button
              onClick={() => router.push('/riwayat')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Total Data</p>
            <p className="text-3xl font-bold text-indigo-900">{data.total_data}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Accept</p>
            <p className="text-3xl font-bold text-green-600">✓ {stats.accepted}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
            <p className="text-sm text-gray-600 mb-2">Reject</p>
            <p className="text-3xl font-bold text-red-600">✗ {stats.rejected}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Rate</p>
            <p className="text-3xl font-bold text-purple-600">{stats.acceptanceRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Sum</p>
            <p className="text-3xl font-bold text-orange-600">{stats.sum.toFixed(2)}</p>
          </div>
        </div>

        {/* Stats Card 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Nilai Maximum</p>
            <p className="text-3xl font-bold text-red-600">{parseFloat(data.nilai_max as any).toFixed(1)} kg</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Nilai Minimum</p>
            <p className="text-3xl font-bold text-blue-600">{parseFloat(data.nilai_min as any).toFixed(1)} kg</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Rata-rata</p>
            <p className="text-3xl font-bold text-green-600">{parseFloat(data.rata_rata as any).toFixed(2)} kg</p>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">Data Input ({dataArray.length} angka)</h2>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
            {dataArray.map((value, idx) => {
              const isAccepted = value >= 4.8 && value < 5.4;
              return (
                <div
                  key={idx}
                  className={`rounded-lg p-3 text-center border-2 ${
                    isAccepted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-600">#{idx + 1}</div>
                  <div
                    className={`text-lg font-bold ${
                      isAccepted ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {value.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleDownloadExcel}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition shadow-lg"
          >
            📊 Download Excel
          </button>
          <button
            onClick={() => router.push('/riwayat')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl transition shadow-lg"
          >
            ← Kembali ke Riwayat
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DownloadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);

  // Handle countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Animated Download Icon */}
          <div className="text-8xl mb-6 animate-bounce">📥</div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-indigo-900 mb-4">File Excel Sedang Didownload...</h1>

          {/* Countdown Number */}
          <div className="text-6xl font-bold text-green-600 mb-6 transition-all duration-300">
            {countdown}
          </div>

          {/* Loading Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
              style={{
                width: `${((3 - countdown) / 3) * 100}%`
              }}
            ></div>
          </div>

          {/* Redirect Message */}
          <p className="text-gray-600 text-sm mb-2">
            Anda akan diarahkan ke halaman utama dalam{' '}
            <span className="font-bold text-indigo-900">{countdown}</span> detik
          </p>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-800 text-sm">
              ✓ File Excel berhasil didownload
            </p>
          </div>

          {/* Manual Back Button */}
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            ← Kembali ke Halaman Utama
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <DownloadPageContent />
    </Suspense>
  );
}

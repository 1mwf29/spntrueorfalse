/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, ShieldCheck, Server, Key, Check, Copy } from 'lucide-react';

interface FirebaseGuideModalProps {
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const envSample = `# Variabel Lingkungan Firebase (Frontend .env)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="hago-quiz.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="hago-quiz"
VITE_FIREBASE_STORAGE_BUCKET="hago-quiz.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Panduan Backend & Sinkronisasi Real-Time</h2>
              <p className="text-xs text-slate-400">Arsitektur Multi-Player & Konfigurasi Eksternal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Current Architecture Status */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex items-start gap-3">
          <Server className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs text-slate-300">
            <span className="font-extrabold text-sm text-emerald-300">
              Backend Real-Time Terpasang & Aktif (Authoritative Server)
            </span>
            <p>
              Aplikasi ini sudah dilengkapi <strong>Server WebSocket Authoritative</strong> bawaan di port 3000. Semua sinkronisasi room, countdown timer, gerakan avatar Chibi, kalkulasi skor anti-cheat, dan kapasitas hingga 40 pemain per room <strong>langsung berfungsi tanpa konfigurasi tambahan</strong> di seluruh perangkat (HP, tablet, dan PC).
            </p>
          </div>
        </div>

        {/* Optional Firebase Integration Guide */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Langkah-Langkah Menghubungkan Firebase / Firestore (Opsional untuk Persistensi Jangka Panjang):
          </h3>

          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 pl-1 leading-relaxed">
            <li>
              Buka konsol <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">Firebase Console</a> dan buat project baru.
            </li>
            <li>
              Di bagian <strong>Build</strong>, aktifkan <strong>Firestore Database</strong> dalam mode <em>Production</em> atau <em>Test</em>.
            </li>
            <li>
              Daftarkan Web App di project settings untuk mendapatkan konfigurasi Firebase Web SDK.
            </li>
            <li>
              Tambahkan variabel lingkungan di bawah ini ke file <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300">.env</code> Anda:
            </li>
          </ol>

          {/* Code snippet */}
          <div className="relative bg-slate-950 rounded-2xl p-3 border border-slate-800 font-mono text-[11px] text-emerald-400">
            <button
              type="button"
              onClick={() => handleCopy(envSample, 'env')}
              className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'env' ? 'Tersalin' : 'Salin'}</span>
            </button>
            <pre className="overflow-x-auto pr-16">{envSample}</pre>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90">
            <Key className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Keamanan:</strong> Jangan pernah membagikan Secret Admin Service Account Key di client-side code. Variabel publik Web SDK aman digunakan di frontend bersama Firestore Security Rules.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer mt-2"
        >
          Tutup Panduan
        </button>
      </div>
    </div>
  );
};

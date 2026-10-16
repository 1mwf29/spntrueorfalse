/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, X, ArrowRight, Copy, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface MyRoomsModalProps {
  onClose: () => void;
  lastRoomCode: string;
  onJoinRoom: (code: string) => void;
}

export function MyRoomsModal({ onClose, lastRoomCode, onJoinRoom }: MyRoomsModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    sound.playCorrect();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d1322] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">ROOM SAYA</h2>
              <p className="text-xs text-slate-400">Riwayat dan room terakhir kamu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {lastRoomCode ? (
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Room Terakhir:</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Tersimpan
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-white/10">
              <span className="font-mono text-xl font-black text-yellow-300 tracking-wider">
                {lastRoomCode}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(lastRoomCode)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onJoinRoom(lastRoomCode);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm shadow flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Masuk Kembali ke Room {lastRoomCode}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-400 flex flex-col items-center gap-2">
            <Layers className="w-8 h-8 text-slate-500" />
            <p className="text-sm font-bold">Belum Ada Riwayat Room</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Buat room baru sebagai Guru atau gabung room kuis dengan kode dari guru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

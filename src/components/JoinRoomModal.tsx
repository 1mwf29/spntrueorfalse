/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gamepad2, X, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface JoinRoomModalProps {
  onClose: () => void;
  onJoin: (code: string) => void;
  initialCode?: string;
}

export function JoinRoomModal({ onClose, onJoin, initialCode = '' }: JoinRoomModalProps) {
  const [code, setCode] = useState(initialCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      sound.playBoing();
      onJoin(code.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d1322] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_15px_60px_rgba(0,0,0,0.8)] flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">GABUNG ROOM</h2>
              <p className="text-xs text-slate-400">Masukkan kode untuk masuk ke arena kuis</p>
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

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2">
              Kode Room (6 Karakter)
            </label>
            <input
              type="text"
              autoFocus
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: CIV892"
              className="w-full bg-[#060911] border-2 border-indigo-500/40 focus:border-indigo-400 rounded-2xl px-4 py-3.5 text-center text-2xl font-black font-mono tracking-widest text-yellow-300 placeholder-slate-600 uppercase focus:outline-none transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-base shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>MASUK KE ARENA</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

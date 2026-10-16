/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { sound } from '../utils/audio';

export const REQUIRED_GURU_PASSWORD = '@ppknibos29';

interface HostPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const HostPasswordModal: React.FC<HostPasswordModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password.trim()) {
      setErrorMsg('Password guru belum diisi!');
      setIsShaking(true);
      sound.playWrong();
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (password.trim() !== REQUIRED_GURU_PASSWORD) {
      setErrorMsg('Password guru salah! Akses Buat Room ditolak.');
      setIsShaking(true);
      sound.playWrong();
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // Success!
    sound.playCorrect();
    setErrorMsg(null);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#0f172a] via-[#090d18] to-[#060810] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col gap-4 text-slate-100 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Glow Ambient */}
        <div className="absolute top-0 right-10 w-44 h-44 bg-emerald-500/15 rounded-full blur-[70px] pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Lock Icon */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>AKSES KHUSUS GURU</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Masukkan password guru untuk membuka menu pembuatan room kuis.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Form (CONFIDENTIAL - NEVER REVEALS THE PASSWORD) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Password Guru</span>
              <span className="text-slate-500 text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Terkunci</span>
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Masukkan password guru..."
                className="w-full bg-[#050811] border-2 border-white/10 focus:border-emerald-400 rounded-xl pl-10 pr-12 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
              />
              <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <span>BUKA MENU BUAT ROOM</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500">
          Hanya Guru atau Host yang memiliki kode sandi yang dapat membuat room kuis.
        </p>
      </div>
    </div>
  );
};

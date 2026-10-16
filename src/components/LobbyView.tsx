/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoomState, AvatarId, Player } from '../types/game';
import { ChibiAvatar } from './ChibiAvatar';
import { AVATAR_LIST, COLOR_PALETTE } from '../utils/avatars';
import {
  Users,
  Copy,
  Check,
  Play,
  Settings,
  BookOpen,
  Crown,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface LobbyViewProps {
  roomState: RoomState;
  myPlayerId: string;
  myPlayer: Player | undefined;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onUpdateProfile: (name: string, avatarId: AvatarId, color: string) => void;
  onOpenSettings: () => void;
  onOpenHostDashboard: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomState,
  myPlayerId,
  myPlayer,
  isHost,
  onStartGame,
  onLeaveRoom,
  onUpdateProfile,
  onOpenSettings,
  onOpenHostDashboard,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);

  const playersList = Object.values(roomState.players);
  const playerCount = playersList.length;
  const maxPlayers = roomState.settings.maxPlayers || 40;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?room=${roomState.roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-2 px-3 sm:px-6">
      {/* HEADER ROOM BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/50 via-slate-900/90 to-indigo-950/50 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Room ID & Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/15 text-emerald-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                CIVIC ROOM LOBBY
              </span>
              {roomState.totalQuestions > 0 ? (
                <span className="text-xs font-semibold text-slate-400">
                  Total {roomState.totalQuestions} Soal
                </span>
              ) : (
                <span className="text-[11px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  ⚠️ Belum Ada Soal
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-widest font-mono bg-[#060911]/90 px-4 py-1.5 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                {roomState.roomId}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-white/10 cursor-pointer"
                title="Salin Kode Room"
              >
                {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bagikan kode atau link room ini kepada teman-temanmu!
            </p>
          </div>

          {/* Quick Actions & Player Count */}
          <div className="flex flex-col items-center sm:items-end gap-2.5">
            <div className="flex items-center gap-2 bg-[#060911]/80 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 shadow">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-emerald-400 font-black text-sm">{playerCount}</strong> / {maxPlayers} Pemain
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Undangan'}</span>
              </button>

              <button
                type="button"
                onClick={onLeaveRoom}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MY AVATAR BAR & CUSTOMIZATION TRIGGER */}
      {myPlayer && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChibiAvatar
              avatarId={myPlayer.avatarId}
              color={myPlayer.color}
              name={myPlayer.name}
              size="md"
              isMe={true}
              showName={false}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white">{myPlayer.name}</span>
                {isHost && (
                  <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    <Crown className="w-3 h-3 text-amber-400" /> Host Room
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Siap bertarung di arena kuis!</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAvatarCustomizer(!showAvatarCustomizer)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-yellow-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Ganti Karakter / Warna</span>
          </button>
        </div>
      )}

      {/* AVATAR CUSTOMIZER DRAWER */}
      {showAvatarCustomizer && myPlayer && (
        <div className="bg-slate-900/90 border-2 border-yellow-500/40 rounded-2xl p-4 flex flex-col gap-4 animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Pilih Karakter Chibi & Warna Favoritmu:
            </h3>
            <button
              type="button"
              onClick={() => setShowAvatarCustomizer(false)}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Tutup ✕
            </button>
          </div>

          {/* Character Choices */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {AVATAR_LIST.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => onUpdateProfile(myPlayer.name, av.id, myPlayer.color)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  myPlayer.avatarId === av.id
                    ? 'bg-yellow-400/20 border-2 border-yellow-400 shadow scale-105'
                    : 'bg-slate-800/60 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <ChibiAvatar
                  avatarId={av.id}
                  color={myPlayer.color}
                  size="sm"
                  showName={false}
                />
                <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                  {av.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Color Choices */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300">Warna Karakter:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateProfile(myPlayer.name, myPlayer.avatarId, c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    myPlayer.color === c ? 'scale-125 ring-3 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAYERS GRID (UP TO 40 PLAYERS WITH BOUNCING CHIBIS) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base text-white">
              Pemain yang Sudah Bergabung ({playerCount})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Maks. 40 Pemain dalam 1 room
          </span>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 max-h-[360px] overflow-y-auto pr-1">
          {playersList.map((player) => {
            const isMe = player.id === myPlayerId;
            return (
              <div
                key={player.id}
                className={`relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border ${
                  isMe
                    ? 'bg-yellow-500/10 border-yellow-400/50 shadow-md ring-2 ring-yellow-400/20'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                {player.isHost && (
                  <div className="absolute top-1 right-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                )}

                <ChibiAvatar
                  avatarId={player.avatarId}
                  color={player.color}
                  name={player.name}
                  size="sm"
                  isMe={isMe}
                  showName={true}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* HOST ACTION BAR / CONTROLS */}
      {isHost ? (
        <div className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenHostDashboard}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Daftar Soal ({roomState.totalQuestions})</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer"
              title="Pengaturan Room"
            >
              <Settings className="w-5 h-5 text-indigo-300" />
            </button>
          </div>

          <button
            type="button"
            onClick={onStartGame}
            disabled={playerCount < 1 || roomState.totalQuestions === 0}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition-transform transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>
              {playerCount < 1
                ? 'MENUNGGU PEMAIN BERGABUNG...'
                : `MULAI PERMAINAN SEKARANG (${roomState.totalQuestions} SOAL)`}
            </span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center justify-center gap-2 text-sm text-slate-300 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-white text-base">
              Menunggu Guru / Host Memulai Permainan...
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            👑 Guru / Host room akan menekan tombol mulai saat semua siswa telah berkumpul. Bersiaplah menggerakkan karaktermu ke sisi BENAR atau SALAH begitu timer berjalan!
          </p>
        </div>
      )}
    </div>
  );
};

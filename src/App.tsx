/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMultiplayer } from './hooks/useMultiplayer';
import { AVATAR_LIST, COLOR_PALETTE } from './utils/avatars';
import { sound } from './utils/audio';
import { AvatarId } from './types/game';
import { ChibiAvatar } from './components/ChibiAvatar';
import { ArenaPlayfield } from './components/ArenaPlayfield';
import { QuestionCard } from './components/QuestionCard';
import { LobbyView } from './components/LobbyView';
import { PodiumView } from './components/PodiumView';
import { HostDashboard } from './components/HostDashboard';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { HostPasswordModal } from './components/HostPasswordModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { MyRoomsModal } from './components/MyRoomsModal';
import { SpnLogo } from './components/SpnLogo';
import heroBanner from './assets/images/civic_arena_hero_1792136553820.jpg';
import { Question } from './types/game';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Play,
  HelpCircle,
  Trophy,
  ArrowRight,
  Database,
  Crown,
  Lock,
  Wifi,
  WifiOff,
  Gamepad2,
  Zap,
  LogIn,
  CheckCircle2,
  BookOpen,
  Palette,
  UserCheck,
  Home,
  Layers,
  User,
  X,
} from 'lucide-react';

export default function App() {
  const {
    playerId,
    myPlayer,
    isHost,
    roomState,
    isConnected,
    connectionError,
    kickedMessage,
    clearKickedMessage,
    joinRoom,
    leaveRoom,
    updateProfile,
    submitChoice,
    hostStartGame,
    hostNextQuestion,
    hostKickPlayer,
    hostUpdateSettings,
    hostUpdateQuestions,
    hostRestartGame,
  } = useMultiplayer();

  // Local user profile state (persisted in localStorage)
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('civic_player_name') || localStorage.getItem('hago_player_name') || '';
  });
  const [avatarId, setAvatarId] = useState<AvatarId>(() => {
    return (localStorage.getItem('civic_avatar_id') as AvatarId) || (localStorage.getItem('hago_avatar_id') as AvatarId) || 'cat';
  });
  const [avatarColor, setAvatarColor] = useState(() => {
    return localStorage.getItem('civic_avatar_color') || localStorage.getItem('hago_avatar_color') || '#fbbf24';
  });

  // Navigation / views
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'join'>('home');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [showHostDashboard, setShowHostDashboard] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showHostPasswordModal, setShowHostPasswordModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showMyRoomsModal, setShowMyRoomsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'bank' | 'rooms' | 'profile'>('home');
  const [lastRoomCode, setLastRoomCode] = useState(() => localStorage.getItem('civic_last_room') || '');

  // Check URL query param for direct room link (e.g., ?room=HAGO88)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const code = roomParam.toUpperCase();
      setInputRoomCode(code);
      setLastRoomCode(code);
      setShowJoinModal(true);
    }
  }, []);

  // Save profile changes
  const saveProfile = (name: string, avId: AvatarId, color: string) => {
    setPlayerName(name);
    setAvatarId(avId);
    setAvatarColor(color);
    localStorage.setItem('civic_player_name', name);
    localStorage.setItem('civic_avatar_id', avId);
    localStorage.setItem('civic_avatar_color', color);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleCreateRoomConfirmed = (params: {
    roomCode: string;
    hostName: string;
    timerSeconds: number;
    speedBonus: boolean;
    streakBonus: boolean;
    questions: Question[];
  }) => {
    saveProfile(params.hostName, avatarId, avatarColor);
    localStorage.setItem('civic_last_room', params.roomCode);
    setLastRoomCode(params.roomCode);
    setShowCreateRoomModal(false);
    joinRoom({
      roomId: params.roomCode,
      playerName: params.hostName,
      avatarId,
      color: avatarColor,
      isHost: true,
      settings: {
        timerSeconds: params.timerSeconds,
        speedBonus: params.speedBonus,
        streakBonus: params.streakBonus,
        maxPlayers: 40,
      },
      initialQuestions: params.questions,
    });
  };

  // Clear any legacy cached host unlock
  useEffect(() => {
    sessionStorage.removeItem('civic_guru_unlocked');
  }, []);

  const handleStartCreateRoom = () => {
    sound.playBoing();
    setShowHostPasswordModal(true);
  };

  const handleQuickCreateRoom = () => {
    handleStartCreateRoom();
  };

  const handleJoinExistingRoom = (code: string) => {
    const trimmedName = playerName.trim() || 'Pemain Keren';
    if (!playerName.trim()) {
      saveProfile(trimmedName, avatarId, avatarColor);
    }
    if (!code.trim()) return;
    const cleanCode = code.trim().toUpperCase();
    localStorage.setItem('civic_last_room', cleanCode);
    setLastRoomCode(cleanCode);
    setShowJoinModal(false);
    setCurrentView('home');
    sound.playBoing();
    joinRoom({
      roomId: cleanCode,
      playerName: trimmedName,
      avatarId,
      color: avatarColor,
      isHost: false,
    });
  };

  // Determine active phase
  const inRoom = Boolean(roomState);
  const isLobby = roomState?.status === 'lobby';
  const isGameActive = roomState?.status === 'question' || roomState?.status === 'reveal';
  const isFinished = roomState?.status === 'finished';

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-indigo-500/5 rounded-full blur-[140px]" />
      </div>

      {/* GLOBAL TOP NAV BAR */}
      <header className="w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-6 py-3 flex items-center justify-between">
        {/* Game Logo Lockup: Civic True False */}
        <div
          onClick={() => {
            if (!inRoom) setCurrentView('home');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-[#0b101b] rounded-[14px] flex items-center justify-center font-black text-sm tracking-wider bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
              CIVIC
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                CIVIC
              </span>
              <span className="text-[11px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                TRUE
              </span>
              <span className="text-slate-500 text-[10px] font-black">/</span>
              <span className="text-[11px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-400/30">
                FALSE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
              Live Multiplayer Arena
            </span>
          </div>
        </div>

        {/* Player Profile Chip (Quick Access) */}
        <button
          type="button"
          onClick={() => {
            if (!inRoom) setShowProfileModal(true);
          }}
          className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-white/10 hover:border-emerald-400/50 rounded-full transition cursor-pointer"
          title="Klik untuk ubah profil & karakter"
        >
          <ChibiAvatar
            avatarId={avatarId}
            color={avatarColor}
            size="sm"
            showName={false}
          />
          <span className="text-xs font-bold text-slate-200 max-w-[95px] truncate">
            {playerName || 'Pemain'}
          </span>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl transition border cursor-pointer ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-slate-900/80 hover:bg-slate-800 border-white/10 text-yellow-400'
            }`}
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Discreet Info Button */}
          <button
            type="button"
            onClick={() => setShowFirebaseGuide(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition border border-white/10 cursor-pointer"
            title="Info Server & Firebase"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DISCONNECTED OR KICKED ALERTS */}
      {connectionError && (
        <div className="bg-rose-600/90 text-white text-xs font-bold text-center py-2 px-4 shadow">
          {connectionError}
        </div>
      )}
      {kickedMessage && (
        <div className="bg-amber-600/90 text-white text-xs font-bold text-center py-2 px-4 shadow flex items-center justify-center gap-2">
          <span>{kickedMessage}</span>
          <button
            type="button"
            onClick={clearKickedMessage}
            className="underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 flex flex-col justify-center items-center py-5 px-3 sm:px-6">
        {/* VIEW 1: ACTIVE ROOM - IN GAME ARENA */}
        {inRoom && isGameActive && roomState && (
          <div className="w-full max-w-2xl flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-300">
            {/* Question Card Banner */}
            <QuestionCard roomState={roomState} />

            {/* Iconic Split Arena Playfield with Direct Click & In-Board Reveal */}
            <ArenaPlayfield
              roomState={roomState}
              myPlayerId={playerId}
              isHost={isHost}
              onSelectChoice={(choice) => submitChoice(choice)}
              onNextQuestion={hostNextQuestion}
            />

            {/* In-Arena Control Hint */}
            <div className="flex items-center justify-center gap-1.5 py-1 text-center">
              <span className="text-xs font-bold text-slate-300 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg flex items-center gap-2">
                <span className="text-emerald-400">⚡</span>
                <span>
                  {myPlayer?.currentChoice
                    ? `Bidakmu di sisi ${myPlayer.currentChoice === 'true' ? 'BENAR ✓' : 'SALAH ✗'}. Ketuk sisi lain pada papan untuk berpindah!`
                    : 'Ketuk langsung sisi KIRI (BENAR) atau KANAN (SALAH) pada papan arena untuk menggerakkan bidakmu!'}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE ROOM - LOBBY WAITING SCREEN */}
        {inRoom && isLobby && roomState && (
          <LobbyView
            roomState={roomState}
            myPlayerId={playerId}
            myPlayer={myPlayer}
            isHost={isHost}
            onStartGame={hostStartGame}
            onLeaveRoom={leaveRoom}
            onUpdateProfile={(name, avId, color) => {
              saveProfile(name, avId, color);
              updateProfile(name, avId, color);
            }}
            onOpenSettings={() => setShowHostDashboard(true)}
            onOpenHostDashboard={() => setShowHostDashboard(true)}
          />
        )}

        {/* VIEW 3: ACTIVE ROOM - PODIUM / GAME OVER */}
        {inRoom && isFinished && roomState && (
          <PodiumView
            roomState={roomState}
            myPlayerId={playerId}
            isHost={isHost}
            onPlayAgain={hostRestartGame}
          />
        )}

        {/* VIEW 4: HOME LANDING SCREEN (CLEAN, MINIMAL GAMING UI MATCHING USER MOCKUP) */}
        {!inRoom && (
          <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-5 py-2 animate-in fade-in zoom-in-95 duration-300 pb-20">
            {/* Clean Hero Game Card */}
            <div className="w-full bg-gradient-to-b from-[#0f172a]/95 to-[#090d18]/95 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.7)] flex flex-col items-center gap-4 text-center backdrop-blur-xl">
              {/* Hero Duel Artwork */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                <img
                  src={heroBanner}
                  alt="Civic Arena Duel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d18] via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-2.5 inset-x-2 flex items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-emerald-300 shadow">
                    🎮 Civic True False Arena
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="flex flex-col items-center gap-1">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  CIVIC{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    TRUE
                  </span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                    FALSE
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Live Multiplayer Quiz Game
                </p>
              </div>

              {/* Two Big Action Buttons */}
              <div className="w-full flex flex-col gap-3 mt-1">
                {/* BUAT ROOM (PASSWORD PROTECTED FOR GURU) */}
                <button
                  type="button"
                  onClick={handleStartCreateRoom}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer relative group"
                >
                  <Lock className="w-5 h-5 text-slate-950" />
                  <span>BUAT ROOM</span>
                  <span className="absolute right-3.5 px-2.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-slate-950/20 shadow-sm">
                    <Lock className="w-3 h-3 text-slate-950" />
                    <span>Terkunci</span>
                  </span>
                </button>

                {/* GABUNG ROOM */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playBoing();
                    setShowJoinModal(true);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-base shadow-[0_0_25px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>GABUNG ROOM</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION DOCK (BERANDA, BANK SOAL, ROOM SAYA, PROFIL) */}
      {!inRoom && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#080d1a]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playBoing();
                setActiveTab('home');
              }}
              className={`py-1.5 flex flex-col items-center gap-1 rounded-xl transition cursor-pointer ${
                activeTab === 'home'
                  ? 'text-emerald-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBoing();
                setShowBankModal(true);
              }}
              className="py-1.5 flex flex-col items-center gap-1 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px]">Bank Soal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBoing();
                setShowMyRoomsModal(true);
              }}
              className="py-1.5 flex flex-col items-center gap-1 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition cursor-pointer"
            >
              <Layers className="w-5 h-5" />
              <span className="text-[10px]">Room Saya</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBoing();
                setShowProfileModal(true);
              }}
              className="py-1.5 flex flex-col items-center gap-1 rounded-xl text-slate-400 hover:text-slate-200 font-semibold transition cursor-pointer"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Profil</span>
            </button>
          </div>
        </nav>
      )}

      {/* JOIN ROOM MODAL */}
      {showJoinModal && (
        <JoinRoomModal
          initialCode={inputRoomCode}
          onClose={() => setShowJoinModal(false)}
          onJoin={(code) => handleJoinExistingRoom(code)}
        />
      )}

      {/* QUESTION BANK MODAL */}
      {showBankModal && (
        <QuestionBankModal
          onClose={() => setShowBankModal(false)}
        />
      )}

      {/* MY ROOMS MODAL */}
      {showMyRoomsModal && (
        <MyRoomsModal
          lastRoomCode={lastRoomCode}
          onClose={() => setShowMyRoomsModal(false)}
          onJoinRoom={(code) => handleJoinExistingRoom(code)}
        />
      )}

      {/* PROFILE & CHIBI CUSTOMIZER MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0d1322] border-2 border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-black text-white">Profil & Karakter Chibi</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live Avatar Preview */}
            <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
              <ChibiAvatar
                avatarId={avatarId}
                color={avatarColor}
                name={playerName || 'Nama Kamu'}
                size="lg"
                state="idle"
                isMe={true}
                showName={true}
              />
              <span className="text-xs text-slate-400">
                Pratinjau tampilan avatarmu di arena pertempuran
              </span>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 block mb-1 uppercase tracking-wider">
                Nama Panggilan Pemain:
              </label>
              <input
                type="text"
                maxLength={15}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Masukkan nama pemainmu..."
                className="w-full bg-[#060911] border border-white/10 focus:border-yellow-400 rounded-2xl px-4 py-3 text-base font-bold text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Select Chibi Avatar */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 block mb-2 uppercase tracking-wider">
                Pilih Karakter Chibi:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {AVATAR_LIST.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setAvatarId(av.id);
                      sound.playBoing();
                    }}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      avatarId === av.id
                        ? 'bg-yellow-400/20 border-2 border-yellow-400 shadow scale-105'
                        : 'bg-slate-800/60 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <ChibiAvatar avatarId={av.id} color={avatarColor} size="sm" showName={false} />
                    <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Color */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 block mb-2 uppercase tracking-wider">
                Pilih Warna Kostum:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setAvatarColor(c);
                      sound.playBoing();
                    }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      avatarColor === c ? 'scale-125 ring-3 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Save & Continue Button */}
            <button
              type="button"
              disabled={!playerName.trim()}
              onClick={() => {
                saveProfile(playerName.trim(), avatarId, avatarColor);
                setShowProfileModal(false);
                sound.playCorrect();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Simpan Profil</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* HOST DASHBOARD MODAL (RESTRICTED TO HOST ONLY) */}
      {showHostDashboard && roomState && isHost && (
        <HostDashboard
          questions={roomState.questions || []}
          settings={roomState.settings}
          players={roomState.players}
          onClose={() => setShowHostDashboard(false)}
          onUpdateQuestions={(q) => hostUpdateQuestions(q)}
          onUpdateSettings={(s) => hostUpdateSettings(s)}
          onKickPlayer={(id) => hostKickPlayer(id)}
        />
      )}

      {/* FIREBASE GUIDE & ARCHITECTURE MODAL */}
      {showFirebaseGuide && (
        <FirebaseGuideModal onClose={() => setShowFirebaseGuide(false)} />
      )}

      {/* HOST PASSWORD GATE MODAL (HOMEPAGE SECURITY FOR BUAT ROOM) */}
      {showHostPasswordModal && (
        <HostPasswordModal
          onClose={() => setShowHostPasswordModal(false)}
          onSuccess={() => {
            setShowHostPasswordModal(false);
            setShowCreateRoomModal(true);
          }}
        />
      )}

      {/* CREATE ROOM MODAL (HOST SETUP POPUP) */}
      {showCreateRoomModal && (
        <CreateRoomModal
          initialHostName={playerName || 'Guru PKn'}
          avatarId={avatarId}
          avatarColor={avatarColor}
          onClose={() => setShowCreateRoomModal(false)}
          onCreateRoom={handleCreateRoomConfirmed}
        />
      )}
    </div>
  );
}

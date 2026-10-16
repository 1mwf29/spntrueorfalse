/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AvatarId =
  | 'cat'
  | 'bear'
  | 'panda'
  | 'bunny'
  | 'fox'
  | 'dino'
  | 'penguin'
  | 'monkey'
  | 'alien'
  | 'robot'
  | 'lion'
  | 'chick'
  | 'frog'
  | 'dog'
  | 'koala'
  | 'tiger';

export interface Player {
  id: string;
  name: string;
  avatarId: AvatarId;
  color: string;
  score: number;
  streak: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentChoice: 'true' | 'false' | null;
  answeredAt: number | null; // epoch timestamp
  lastPointsEarned: number;
  isHost: boolean;
  isReady: boolean;
  // Visual positions in the arena:
  // x: -1 (far left/True), 0 (center neutral), 1 (far right/False)
  // y: 0.1 to 0.9 (vertical scatter to prevent overlapping 40 players)
  posX: number;
  posY: number;
  isEliminated?: boolean;
}

export interface Question {
  id: string;
  statement: string;
  answer: boolean; // true = BENAR, false = SALAH
  explanation: string;
  category: string;
  duration?: number; // optional custom duration in seconds
}

export type GameStatus =
  | 'lobby'
  | 'starting'
  | 'question'
  | 'reveal'
  | 'leaderboard'
  | 'finished';

export interface RoomSettings {
  timerSeconds: number; // e.g. 5, 10, 15, 20
  speedBonus: boolean;
  streakBonus: boolean;
  maxPlayers: number;
}

export interface RoomState {
  roomId: string;
  status: GameStatus;
  hostId: string;
  settings: RoomSettings;
  players: Record<string, Player>;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: {
    id: string;
    statement: string;
    category: string;
    duration: number;
  } | null;
  questions?: Question[];
  // Revealed answer is only sent during 'reveal' & 'finished' state
  roundResult?: {
    correctAnswer: boolean;
    explanation: string;
    correctPlayerIds: string[];
    wrongPlayerIds: string[];
    unansweredPlayerIds: string[];
  };
  timeRemaining: number;
  roundStartTime: number;
}

// Socket message types
export type ClientMessageType =
  | 'join_room'
  | 'leave_room'
  | 'set_ready'
  | 'update_profile'
  | 'submit_choice'
  | 'host_start_game'
  | 'host_next_question'
  | 'host_kick_player'
  | 'host_update_settings'
  | 'host_update_questions'
  | 'host_restart_game';

export interface ClientMessage {
  type: ClientMessageType;
  roomId?: string;
  playerId?: string;
  payload?: any;
}

export type ServerMessageType =
  | 'room_state'
  | 'player_joined'
  | 'player_left'
  | 'choice_updated'
  | 'round_started'
  | 'round_revealed'
  | 'game_finished'
  | 'error'
  | 'kicked';

export interface ServerMessage {
  type: ServerMessageType;
  payload: any;
}

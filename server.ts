/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_QUESTIONS } from './src/data/defaultQuestions.ts';
import {
  Player,
  Question,
  RoomState,
  RoomSettings,
  ClientMessage,
  ServerMessage,
  AvatarId,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory Server State
interface ServerRoom {
  id: string;
  hostId: string;
  status: RoomState['status'];
  settings: RoomSettings;
  players: Map<string, Player>;
  sockets: Map<string, WebSocket>;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number;
  roundStartTime: number;
  timerInterval?: NodeJS.Timeout;
  autoRevealTimeout?: NodeJS.Timeout;
}

const rooms = new Map<string, ServerRoom>();

// Generate short readable room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Convert ServerRoom to client-safe RoomState
function getClientRoomState(room: ServerRoom): RoomState {
  const playersObj: Record<string, Player> = {};
  room.players.forEach((p, id) => {
    playersObj[id] = { ...p };
  });

  const curQ = room.questions[room.currentQuestionIndex];
  const safeQuestion = curQ
    ? {
        id: curQ.id,
        statement: curQ.statement,
        category: curQ.category,
        duration: curQ.duration || room.settings.timerSeconds,
      }
    : null;

  let roundResult: RoomState['roundResult'] = undefined;
  if (room.status === 'reveal' && curQ) {
    const correctPlayerIds: string[] = [];
    const wrongPlayerIds: string[] = [];
    const unansweredPlayerIds: string[] = [];

    room.players.forEach((p) => {
      if (p.currentChoice === null) {
        unansweredPlayerIds.push(p.id);
      } else {
        const isCorrect = (p.currentChoice === 'true') === curQ.answer;
        if (isCorrect) {
          correctPlayerIds.push(p.id);
        } else {
          wrongPlayerIds.push(p.id);
        }
      }
    });

    roundResult = {
      correctAnswer: curQ.answer,
      explanation: curQ.explanation,
      correctPlayerIds,
      wrongPlayerIds,
      unansweredPlayerIds,
    };
  }

  return {
    roomId: room.id,
    status: room.status,
    hostId: room.hostId,
    settings: room.settings,
    players: playersObj,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    currentQuestion: safeQuestion,
    questions: room.questions,
    roundResult,
    timeRemaining: room.timeRemaining,
    roundStartTime: room.roundStartTime,
  };
}

// Broadcast room state to all clients in room
function broadcastToRoom(room: ServerRoom, message: ServerMessage) {
  const data = JSON.stringify(message);
  room.sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

function broadcastRoomState(room: ServerRoom) {
  const state = getClientRoomState(room);
  broadcastToRoom(room, {
    type: 'room_state',
    payload: state,
  });
}

// Create or get room
function getOrCreateRoom(
  roomId: string,
  hostId: string,
  initialQuestions?: Question[],
  initialSettings?: Partial<RoomSettings>
): { room: ServerRoom; isNew: boolean } {
  let room = rooms.get(roomId);
  let isNew = false;
  if (!room) {
    isNew = true;
    const defaultTimer = initialSettings?.timerSeconds || 15;
    room = {
      id: roomId,
      hostId,
      status: 'lobby',
      settings: {
        timerSeconds: defaultTimer,
        speedBonus: initialSettings?.speedBonus ?? true,
        streakBonus: initialSettings?.streakBonus ?? true,
        maxPlayers: initialSettings?.maxPlayers ?? 40,
      },
      players: new Map(),
      sockets: new Map(),
      questions: initialQuestions && initialQuestions.length > 0
        ? [...initialQuestions]
        : [],
      currentQuestionIndex: 0,
      timeRemaining: defaultTimer,
      roundStartTime: 0,
    };
    rooms.set(roomId, room);
  }
  return { room, isNew };
}

// Start question round
function startQuestionRound(room: ServerRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.autoRevealTimeout) clearTimeout(room.autoRevealTimeout);

  const curQ = room.questions[room.currentQuestionIndex];
  if (!curQ) {
    room.status = 'finished';
    broadcastRoomState(room);
    return;
  }

  const duration = curQ.duration || room.settings.timerSeconds || 10;
  room.status = 'question';
  room.timeRemaining = duration;
  room.roundStartTime = Date.now();

  // Reset players choices & place in center corridor
  let idx = 0;
  const total = room.players.size;
  room.players.forEach((p) => {
    p.currentChoice = null;
    p.answeredAt = null;
    p.lastPointsEarned = 0;
    // Spread vertically along center (posX = 0)
    p.posX = 0;
    p.posY = total > 1 ? 0.15 + (idx / Math.max(total - 1, 1)) * 0.7 : 0.5;
    idx++;
  });

  broadcastRoomState(room);

  // Authoritative countdown timer: ONLY reveals when timeRemaining strictly hits 0!
  room.timerInterval = setInterval(() => {
    room.timeRemaining -= 1;
    if (room.timeRemaining <= 0) {
      clearInterval(room.timerInterval);
      revealAnswer(room);
    } else {
      broadcastRoomState(room);
    }
  }, 1000);
}

// Advance to next question or finish game
function advanceToNextQuestion(room: ServerRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.currentQuestionIndex += 1;
  if (room.currentQuestionIndex >= room.questions.length) {
    room.status = 'finished';
    broadcastRoomState(room);
  } else {
    startQuestionRound(room);
  }
}

// Reveal answer, calculate points, and start 5-second automatic countdown to next question
function revealAnswer(room: ServerRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  const curQ = room.questions[room.currentQuestionIndex];
  if (!curQ) return;

  room.status = 'reveal';
  const duration = curQ.duration || room.settings.timerSeconds || 10;

  // Process scores
  room.players.forEach((p) => {
    if (p.currentChoice !== null) {
      const isCorrect = (p.currentChoice === 'true') === curQ.answer;
      if (isCorrect) {
        let earned = 1000;
        // Speed bonus: up to 500 bonus points
        if (room.settings.speedBonus && p.answeredAt) {
          const timeTakenSec = Math.max(0, (p.answeredAt - room.roundStartTime) / 1000);
          const ratio = Math.max(0, Math.min(1, (duration - timeTakenSec) / duration));
          earned += Math.round(ratio * 500);
        }
        // Streak bonus
        if (room.settings.streakBonus) {
          earned += p.streak * 100;
        }

        p.streak += 1;
        p.score += earned;
        p.correctAnswers += 1;
        p.lastPointsEarned = earned;
      } else {
        p.streak = 0;
        p.wrongAnswers += 1;
        p.lastPointsEarned = 0;
      }
    } else {
      p.streak = 0;
      p.lastPointsEarned = 0;
    }
  });

  // 5-second automatic countdown before transitioning to next question or podium
  room.timeRemaining = 5;
  broadcastRoomState(room);

  room.timerInterval = setInterval(() => {
    room.timeRemaining -= 1;
    if (room.timeRemaining <= 0) {
      clearInterval(room.timerInterval);
      advanceToNextQuestion(room);
    } else {
      broadcastRoomState(room);
    }
  }, 1000);
}

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentPlayerId: string | null = null;

  ws.on('message', (raw) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'join_room': {
          const { roomId, playerId, playerName, avatarId, color, settings, initialQuestions } = msg.payload || {};
          const targetRoomId = (roomId || generateRoomCode()).toUpperCase().trim();
          const { room, isNew } = getOrCreateRoom(targetRoomId, playerId, initialQuestions, settings);

          // Check room capacity (max 40)
          if (!room.players.has(playerId) && room.players.size >= room.settings.maxPlayers) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: 'Room sudah penuh (maksimal 40 pemain)!',
            }));
            return;
          }

          currentRoomId = targetRoomId;
          currentPlayerId = playerId;
          room.sockets.set(playerId, ws);

          const existingPlayer = room.players.get(playerId);
          // Only the initial creator or existing designated host is host!
          // New joiners can NEVER become host unless the host left.
          const isUserHost = isNew || room.hostId === playerId;
          if (isNew) {
            room.hostId = playerId;
          }

          // Scatter position for arena flocking
          const randomY = 0.2 + Math.random() * 0.6;
          const player: Player = {
            id: playerId,
            name: playerName || `Player ${room.players.size + 1}`,
            avatarId: avatarId || 'cat',
            color: color || '#38bdf8',
            score: existingPlayer ? existingPlayer.score : 0,
            streak: existingPlayer ? existingPlayer.streak : 0,
            correctAnswers: existingPlayer ? existingPlayer.correctAnswers : 0,
            wrongAnswers: existingPlayer ? existingPlayer.wrongAnswers : 0,
            currentChoice: existingPlayer ? existingPlayer.currentChoice : null,
            answeredAt: existingPlayer ? existingPlayer.answeredAt : null,
            lastPointsEarned: 0,
            isHost: isUserHost,
            isReady: true,
            posX: 0,
            posY: randomY,
          };

          room.players.set(playerId, player);

          broadcastRoomState(room);
          break;
        }

        case 'leave_room': {
          if (currentRoomId && currentPlayerId) {
            const room = rooms.get(currentRoomId);
            if (room) {
              room.players.delete(currentPlayerId);
              room.sockets.delete(currentPlayerId);

              // If host left, assign new host if any players remain
              if (room.hostId === currentPlayerId && room.players.size > 0) {
                const nextHostId = room.players.keys().next().value;
                if (nextHostId) {
                  room.hostId = nextHostId;
                  const newHost = room.players.get(nextHostId);
                  if (newHost) newHost.isHost = true;
                }
              }

              if (room.players.size === 0) {
                if (room.timerInterval) clearInterval(room.timerInterval);
                rooms.delete(currentRoomId);
              } else {
                broadcastRoomState(room);
              }
            }
          }
          break;
        }

        case 'update_profile': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;
          const p = room.players.get(currentPlayerId);
          if (p) {
            if (msg.payload.name) p.name = msg.payload.name.slice(0, 15);
            if (msg.payload.avatarId) p.avatarId = msg.payload.avatarId as AvatarId;
            if (msg.payload.color) p.color = msg.payload.color;
            broadcastRoomState(room);
          }
          break;
        }

        case 'submit_choice': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.status !== 'question') return;

          const p = room.players.get(currentPlayerId);
          if (!p) return;

          // Allow players to change their choice as many times as they want!
          const choice: 'true' | 'false' = msg.payload.choice;
          p.currentChoice = choice;
          p.answeredAt = Date.now();

          // Physical HAGO split movement:
          // BENAR (true) walks to Left (posX: -0.65 + small jitter)
          // SALAH (false) walks to Right (posX: 0.65 + small jitter)
          const jitterX = (Math.random() - 0.5) * 0.35;
          const jitterY = 0.15 + Math.random() * 0.7;
          p.posX = choice === 'true' ? -0.65 + jitterX : 0.65 + jitterX;
          p.posY = jitterY;

          // Broadcast immediately so avatars visibly walk/trot to their side!
          // We DO NOT reveal the answer early. We let players keep choosing until timer hits 0!
          broadcastRoomState(room);
          break;
        }

        case 'host_start_game': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          if (room.questions.length === 0) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: 'Bank soal masih kosong! Guru / Host harus menambahkan minimal 1 soal terlebih dahulu.',
            }));
            return;
          }

          room.currentQuestionIndex = 0;
          // Reset all players stats
          room.players.forEach((p) => {
            p.score = 0;
            p.streak = 0;
            p.correctAnswers = 0;
            p.wrongAnswers = 0;
            p.currentChoice = null;
          });

          startQuestionRound(room);
          break;
        }

        case 'host_next_question': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          advanceToNextQuestion(room);
          break;
        }

        case 'host_kick_player': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          const targetId = msg.payload.targetPlayerId;
          if (targetId && targetId !== room.hostId) {
            const targetSocket = room.sockets.get(targetId);
            if (targetSocket) {
              targetSocket.send(JSON.stringify({
                type: 'kicked',
                payload: 'Kamu telah dikeluarkan dari room oleh Host.',
              }));
            }
            room.players.delete(targetId);
            room.sockets.delete(targetId);
            broadcastRoomState(room);
          }
          break;
        }

        case 'host_update_settings': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          if (msg.payload.timerSeconds) room.settings.timerSeconds = msg.payload.timerSeconds;
          if (typeof msg.payload.speedBonus === 'boolean') room.settings.speedBonus = msg.payload.speedBonus;
          if (typeof msg.payload.streakBonus === 'boolean') room.settings.streakBonus = msg.payload.streakBonus;

          broadcastRoomState(room);
          break;
        }

        case 'host_update_questions': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          if (Array.isArray(msg.payload.questions) && msg.payload.questions.length > 0) {
            room.questions = msg.payload.questions;
            broadcastRoomState(room);
          }
          break;
        }

        case 'host_restart_game': {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.hostId !== currentPlayerId) return;

          if (room.timerInterval) clearInterval(room.timerInterval);
          room.status = 'lobby';
          room.currentQuestionIndex = 0;
          room.players.forEach((p) => {
            p.score = 0;
            p.streak = 0;
            p.correctAnswers = 0;
            p.wrongAnswers = 0;
            p.currentChoice = null;
            p.posX = 0;
          });
          broadcastRoomState(room);
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentPlayerId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.players.delete(currentPlayerId);
        room.sockets.delete(currentPlayerId);

        if (room.hostId === currentPlayerId && room.players.size > 0) {
          const nextHostId = room.players.keys().next().value;
          if (nextHostId) {
            room.hostId = nextHostId;
            const newHost = room.players.get(nextHostId);
            if (newHost) newHost.isHost = true;
          }
        }

        if (room.players.size === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          rooms.delete(currentRoomId);
        } else {
          broadcastRoomState(room);
        }
      }
    }
  });
});

// REST Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
});

app.get('/api/rooms/:roomId', (req: Request, res: Response) => {
  const room = rooms.get(req.params.roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room tidak ditemukan' });
  }
  return res.json({
    roomId: room.id,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    status: room.status,
    totalQuestions: room.questions.length,
  });
});

// Serve frontend with Vite middlewares in dev or dist in prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`🎮 Civic True False Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

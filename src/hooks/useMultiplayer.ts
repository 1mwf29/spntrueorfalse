/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RoomState,
  Player,
  AvatarId,
  Question,
  ClientMessage,
  ServerMessage,
} from '../types/game';
import { sound } from '../utils/audio';

// Unique persistent client id per browser tab
function getOrCreatePlayerId(): string {
  let id = sessionStorage.getItem('hago_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('hago_player_id', id);
  }
  return id;
}

export function useMultiplayer() {
  const [playerId] = useState<string>(getOrCreatePlayerId);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [kickedMessage, setKickedMessage] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const prevTimeRemainingRef = useRef<number | null>(null);

  // Send message over WebSocket
  const sendMessage = useCallback((msg: ClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          if (msg.type === 'room_state') {
            const newState: RoomState = msg.payload;
            setRoomState(newState);

            // Audio cues based on state transitions
            if (prevStatusRef.current !== newState.status) {
              if (newState.status === 'question') {
                sound.playStart();
              } else if (newState.status === 'reveal' && newState.roundResult) {
                const myP = newState.players[playerId];
                if (myP && myP.currentChoice !== null) {
                  const isCorrect = (myP.currentChoice === 'true') === newState.roundResult.correctAnswer;
                  if (isCorrect) {
                    sound.playCorrect();
                  } else {
                    sound.playWrong();
                  }
                } else {
                  sound.playWrong();
                }
              } else if (newState.status === 'finished') {
                sound.playVictory();
              }
              prevStatusRef.current = newState.status;
            }

            // Audio tick for question countdown
            if (newState.status === 'question' && newState.timeRemaining !== prevTimeRemainingRef.current) {
              if (newState.timeRemaining <= 3 && newState.timeRemaining > 0) {
                sound.playTick(true);
              } else if (newState.timeRemaining > 3) {
                sound.playTick(false);
              }
              prevTimeRemainingRef.current = newState.timeRemaining;
            }
          } else if (msg.type === 'error') {
            setConnectionError(msg.payload);
          } else if (msg.type === 'kicked') {
            setKickedMessage(msg.payload);
            setRoomState(null);
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Automatic reconnection attempt
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setIsConnected(false);
      };

      socketRef.current = ws;
    } catch (e) {
      console.error('WebSocket init failed:', e);
      setConnectionError('Tidak dapat terhubung ke server');
    }
  }, [playerId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Actions
  const joinRoom = useCallback(
    (params: {
      roomId: string;
      playerName: string;
      avatarId: AvatarId;
      color: string;
      isHost?: boolean;
      settings?: Partial<{
        timerSeconds: number;
        speedBonus: boolean;
        streakBonus: boolean;
        maxPlayers: number;
      }>;
      initialQuestions?: Question[];
    }) => {
      sendMessage({
        type: 'join_room',
        payload: {
          ...params,
          playerId,
        },
      });
    },
    [sendMessage, playerId]
  );

  const leaveRoom = useCallback(() => {
    sendMessage({ type: 'leave_room' });
    setRoomState(null);
  }, [sendMessage]);

  const updateProfile = useCallback(
    (name: string, avatarId: AvatarId, color: string) => {
      sendMessage({
        type: 'update_profile',
        payload: { name, avatarId, color },
      });
    },
    [sendMessage]
  );

  const submitChoice = useCallback(
    (choice: 'true' | 'false') => {
      sound.playBoing();
      sendMessage({
        type: 'submit_choice',
        payload: { choice },
      });
    },
    [sendMessage]
  );

  const hostStartGame = useCallback(() => {
    sound.playBoing();
    sendMessage({ type: 'host_start_game' });
  }, [sendMessage]);

  const hostNextQuestion = useCallback(() => {
    sound.playBoing();
    sendMessage({ type: 'host_next_question' });
  }, [sendMessage]);

  const hostKickPlayer = useCallback(
    (targetPlayerId: string) => {
      sound.playBoing();
      sendMessage({
        type: 'host_kick_player',
        payload: { targetPlayerId },
      });
    },
    [sendMessage]
  );

  const hostUpdateSettings = useCallback(
    (settings: { timerSeconds?: number; speedBonus?: boolean; streakBonus?: boolean }) => {
      sendMessage({
        type: 'host_update_settings',
        payload: settings,
      });
    },
    [sendMessage]
  );

  const hostUpdateQuestions = useCallback(
    (questions: Question[]) => {
      sendMessage({
        type: 'host_update_questions',
        payload: { questions },
      });
    },
    [sendMessage]
  );

  const hostRestartGame = useCallback(() => {
    sound.playBoing();
    sendMessage({ type: 'host_restart_game' });
  }, [sendMessage]);

  const myPlayer: Player | undefined = roomState?.players[playerId];
  const isHost = myPlayer?.isHost || roomState?.hostId === playerId;

  return {
    playerId,
    myPlayer,
    isHost,
    roomState,
    isConnected,
    connectionError,
    kickedMessage,
    clearKickedMessage: () => setKickedMessage(null),
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
  };
}

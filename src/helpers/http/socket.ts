// src/socket.ts
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '.';

// Делаем socket типом Socket | null
let socket: Socket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export const connectSocket = (userId: string) => {
  socket = io(BASE_URL, {
    path: '/ws',
    query: {
      userId, // Передаём userId при подключении
    },
    transports: ['websocket'], // Используем только WebSocket
    reconnection: true, // Включаем переподключение
    reconnectionAttempts: Infinity, // Бесконечные попытки переподключения
    reconnectionDelay: 5000, // Задержка между попытками (1 секунда)
  });

  // Обработка успешного подключения
  socket.on('connect', () => {
    console.log('✅ Connected to Socket.io server');
    socket?.emit('online', userId); // Уведомляем сервер о подключении

    // Запускаем heartbeat
    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(() => {
        socket?.emit('heartbeat');
      }, 30000); // каждые 30 сек
    }
  });

  // Обработка отключения
  socket.on('disconnect', (reason) => {
    // console.log('⚠️ Disconnected from Socket.io server:', reason);

    // Очищаем heartbeat при отключении
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    if (reason === 'io server disconnect') {
      // Если сервер отключил сокет, нужно вручную подключиться снова
      socket?.connect();
    }
  });

  // Обработка ошибок
  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Reconnect attempt #${attemptNumber}`);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Failed to reconnect to Socket.io server');
  });

  return socket;
};

// Возвращаем socket или null
export const getSocket = () => {
  return socket;
};

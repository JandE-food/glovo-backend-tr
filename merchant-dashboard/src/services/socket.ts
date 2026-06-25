import { io } from 'socket.io-client';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://135.125.184.123:3000';

export const socket = io(API_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});

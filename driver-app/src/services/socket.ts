import { io } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://135.125.184.123:3000';

export const driverSocket = io(API_URL, {
  autoConnect: false,
  transports: ['websocket']
});

export const connectDriverSocket = () => {
  if (!driverSocket.connected) {
    driverSocket.connect();
    driverSocket.emit('driver_room_join');
  }

  return driverSocket;
};

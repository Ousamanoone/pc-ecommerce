import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export default socket;
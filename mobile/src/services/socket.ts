import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://10.0.2.2:5000'; // Match backend URL

class SocketService {
  public socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Add more methods here to emit and listen to specific events
  // like start_tracking, update_location, join_group
}

export const socketService = new SocketService();

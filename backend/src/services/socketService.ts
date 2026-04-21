import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../utils/prisma';

interface ConnectedUser {
  socketId: string;
  userId: string;
}

class SocketService {
  private io: Server;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.frontendUrl,
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const payload = verifyAccessToken(token);
        
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, isSuspended: true },
        });

        if (!user || user.isSuspended) {
          return next(new Error('User not found or suspended'));
        }

        socket.data.user = {
          userId: user.id,
        };

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user?.userId;
      
      if (userId) {
        this.connectedUsers.set(userId, { socketId: socket.id, userId });
        
        this.updateUserOnlineStatus(userId, true);

        this.socketToUser(userId).emit('user:online', { userId });

        socket.on('disconnect', () => {
          this.connectedUsers.delete(userId);
          this.updateUserOnlineStatus(userId, false);
          this.socketToUser(userId).emit('user:offline', { userId });
        });

        socket.on('message:send', (data) => {
          this.handleMessageSend(socket, data);
        });

        socket.on('typing:start', (data) => {
          const conversationId = data.conversationId;
          socket.to(`conversation:${conversationId}`).emit('typing:start', { userId });
        });

        socket.on('typing:stop', (data) => {
          const conversationId = data.conversationId;
          socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId });
        });
      }
    });
  }

  private async handleMessageSend(socket: Socket, data: { conversationId: string; content: string }) {
    const userId = socket.data.user?.userId;
    const { conversationId, content } = data;

    try {
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });

      if (!participant) {
        socket.emit('error', { message: 'Not a participant of this conversation' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      this.io.to(`conversation:${conversationId}`).emit('message:receive', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });
  }

  socketToUser(userId: string) {
    const connectedUser = this.connectedUsers.get(userId);
    if (connectedUser) {
      return this.io.to(connectedUser.socketId);
    }
    return {
      emit: () => {},
    };
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  emitNotification(userId: string, notification: any) {
    this.socketToUser(userId).emit('notification:new', notification);
  }

  emitRequestUpdate(requestId: string, event: 'request:accepted' | 'request:rejected', data: any) {
    this.io.to(`request:${requestId}`).emit(event, data);
  }

  joinConversation(socket: Socket, conversationId: string) {
    socket.join(`conversation:${conversationId}`);
  }

  leaveConversation(socket: Socket, conversationId: string) {
    socket.leave(`conversation:${conversationId}`);
  }

  joinRequest(socket: Socket, requestId: string) {
    socket.join(`request:${requestId}`);
  }

  leaveRequest(socket: Socket, requestId: string) {
    socket.leave(`request:${requestId}`);
  }

  getIO() {
    return this.io;
  }

  getConnectedUsers() {
    return this.connectedUsers;
  }
}

export default SocketService;

let socketService: SocketService | null = null;

export function initSocketService(httpServer: HttpServer) {
  socketService = new SocketService(httpServer);
  return socketService;
}

export function getSocketService() {
  return socketService;
}
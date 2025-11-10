import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Socket>();

  constructor(private chatService: ChatService) {}

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    // Remove socket mapping when user disconnects
    for (const [userId, sock] of this.userSockets.entries()) {
      if (sock.id === socket.id) {
        this.userSockets.delete(userId);
        console.log(`Removed socket mapping for user ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`Registering user ${userId} with socket ${socket.id}`);
    this.userSockets.set(userId, socket);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { senderId: number; receiverId: number; content: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`💬 Message from ${data.senderId} to ${data.receiverId}: ${data.content}`);
    
    const message = await this.chatService.saveMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    // Get receiver's socket
    const receiverSocket = this.userSockets.get(data.receiverId.toString());
    if (receiverSocket) {
      console.log(`✉️ Sending message to socket ${receiverSocket.id}`);
      receiverSocket.emit('receive_message', message);
    } else {
      console.log(`⚠️ Receiver ${data.receiverId} not connected`);
      // Store message for later delivery if needed
    }

    // Also send back to sender for confirmation
    socket.emit('receive_message', message);

    return message;
  }
}
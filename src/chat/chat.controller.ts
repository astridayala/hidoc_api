import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':user1/:user2')
  async getConversation(@Param('user1') user1: number, @Param('user2') user2: number) {
    return this.chatService.getConversation(user1, user2);
  }
}

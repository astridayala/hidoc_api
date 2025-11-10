import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(senderId: number, receiverId: number, content: string) {
    const message = this.messageRepository.create({ senderId, receiverId, content });
    return this.messageRepository.save(message);
  }

  async getConversation(user1: number, user2: number) {
    return this.messageRepository.find({
      where: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}

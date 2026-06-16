import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }
}

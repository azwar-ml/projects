import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, pass: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    await this.userRepository.save(user);
    
    return { message: 'User registered successfully' };
  }

  async login(email: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
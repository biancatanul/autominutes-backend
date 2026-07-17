import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser(dto.name, dto.email, passwordHash);
    return this.buildAuthResponse(user.id, user.name, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid email or password');

    return this.buildAuthResponse(user.id, user.name, user.email);
  }

  private buildAuthResponse(id: string, name: string, email: string) {
    const token = this.jwtService.sign({ sub: id, email });
    return { access_token: token, user: { id, name, email } };
  }
}

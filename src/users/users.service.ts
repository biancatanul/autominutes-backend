import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(name: string, email: string, passwordHash: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('User with this email already exists');

    return this.userModel.create({ name, email, password: passwordHash });
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
  async updateProfile(id: string, updates: { name?: string; avatarIcon?: string }) {
    const user = await this.userModel.findByIdAndUpdate(id, updates, { new: true });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(id).select('+password');
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }
}

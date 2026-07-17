import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true }) // no duplicate signups with the same email
  email: string;

  @Prop({ required: true, select: false }) // does not return the password field by default when querying the user
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

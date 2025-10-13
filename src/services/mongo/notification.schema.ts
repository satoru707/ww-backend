import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type Document = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true, default: 'PUSH' })
  type: 'EMAIL' | 'PUSH';

  @Prop({ required: true })
  message: string;

  @Prop({ default: new Date() })
  sentAt: string;

  @Prop({ default: true })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

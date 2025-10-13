import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type Document = HydratedDocument<Logs>;

@Schema()
export class Logs {
  @Prop({ required: true })
  actionType: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ index: true })
  familyId?: string;

  @Prop({ type: Object })
  // details can be structured data or a stringified payload
  details: Record<string, unknown> | string;

  @Prop({ default: 'INFO' })
  level: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);

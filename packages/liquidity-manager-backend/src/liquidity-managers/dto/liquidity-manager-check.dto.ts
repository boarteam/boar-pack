import { JoiSchema } from "nestjs-joi";
import Joi from "joi";

export class LiquidityManagerCheckDto {
  @JoiSchema(Joi.string().uuid({ version: 'uuidv4' }).optional())
  id: string;

  @JoiSchema(Joi.string().hostname().required())
  host: string;

  @JoiSchema(Joi.number().required())
  port: number;

  @JoiSchema(Joi.bool().optional().default(true))
  enabled: boolean;

  @JoiSchema(Joi.string().required())
  user: string;

  @JoiSchema(Joi.string().optional())
  pass: string;

  @JoiSchema(Joi.string().required())
  database: string;
}

export enum LiquidityManagerConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export class LiquidityManagerCheckResponseDto {
  status: LiquidityManagerConnectionStatus;
  message?: string;
}

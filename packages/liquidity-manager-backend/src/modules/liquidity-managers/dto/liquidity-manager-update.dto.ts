import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { Colors, LiquidityManagerWorkers } from "../entities/liquidity-manager.entity";

export class LiquidityManagerUpdateDto {
  @JoiSchema(Joi.string().optional())
  name?: string;

  @JoiSchema(Joi.string().hostname().optional())
  host?: string;

  @JoiSchema(Joi.number().optional())
  port?: number;

  @JoiSchema(Joi.bool().optional())
  enabled?: boolean;

  @JoiSchema(Joi.string().optional())
  user?: string;

  @JoiSchema(Joi.string().optional())
  pass?: string;

  @JoiSchema(Joi.string().optional())
  database?: string;

  @JoiSchema(Joi.string().valid(...Object.values(LiquidityManagerWorkers)).optional())
  worker?: LiquidityManagerWorkers;

  @JoiSchema(Joi.string().valid(...Object.values(Colors)).optional())
  color?: Colors;
}

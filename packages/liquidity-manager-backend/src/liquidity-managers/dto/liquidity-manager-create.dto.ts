import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { Colors, LiquidityManagerWorkers } from "../entities/liquidity-manager.entity";

export class LiquidityManagerCreateDto {
  @JoiSchema(Joi.string().required())
  name: string;

  @JoiSchema(Joi.string().hostname().required())
  host: string;

  @JoiSchema(Joi.number().required())
  port: number;

  @JoiSchema(Joi.bool().optional().default(true))
  enabled: boolean;

  @JoiSchema(Joi.string().required())
  user: string;

  @JoiSchema(Joi.string().required())
  pass: string;

  @JoiSchema(Joi.string().required())
  database: string;

  @JoiSchema(Joi.string().valid(...Object.values(LiquidityManagerWorkers)).required())
  worker: LiquidityManagerWorkers;

  @JoiSchema(Joi.string().valid(...Object.values(Colors)).required())
  color: Colors;
}

import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnConnectSchemaCreateDto {
  @JoiSchema(Joi.number().integer().min(0).required())
  fromModuleId: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  toModuleId: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  enabled?: number;

  @JoiSchema(Joi.string().max(512).allow(null))
  descr?: string;
}

import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnConnectSchemaUpdateDto {
  @JoiSchema(Joi.number().integer().min(0).optional())
  fromModuleId?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  toModuleId?: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  enabled?: number;

  @JoiSchema(Joi.string().max(512).allow(null).optional())
  descr?: string;
}

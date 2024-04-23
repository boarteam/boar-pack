import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnModuleCreateDto {
  @JoiSchema(Joi.number().positive().integer().optional())
  id?: number;

  @JoiSchema(Joi.string().required())
  name: string;

  @JoiSchema(Joi.string().allow(null, '').optional())
  descr?: string | null;

  @JoiSchema(Joi.number().required())
  type: number;

  @JoiSchema(Joi.number().required())
  enabled: number;
}


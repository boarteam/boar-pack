import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnModuleUpdateDto {
  @JoiSchema(Joi.string().optional())
  name?: string;

  @JoiSchema(Joi.string().allow(null, '').optional())
  descr?: string | null;

  @JoiSchema(Joi.number().optional())
  type?: number;

  @JoiSchema(Joi.number().optional())
  enabled?: number;
}

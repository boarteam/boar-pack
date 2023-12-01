import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnModuleTypeUpdateDto {
  @JoiSchema(Joi.string().optional())
  name?: string;

  @JoiSchema(Joi.string().allow(null, '').optional())
  descr?: string | null;
}

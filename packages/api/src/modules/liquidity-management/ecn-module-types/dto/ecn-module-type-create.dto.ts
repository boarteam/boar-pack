import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnModuleTypeCreateDto {
  @JoiSchema(Joi.string().required())
  name: string;

  @JoiSchema(Joi.string().allow(null, '').optional())
  descr?: string | null;
}


import { JoiSchema } from 'nestjs-joi';
import Joi from 'joi';

export class EcnInstrumentsGroupCreateDto {
  @JoiSchema(Joi.string().max(24).required())
  name: string;

  @JoiSchema(Joi.string().max(64).allow(null))
  descr?: string;
}

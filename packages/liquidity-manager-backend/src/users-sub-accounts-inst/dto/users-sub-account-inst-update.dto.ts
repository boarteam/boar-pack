import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class UsersSubAccountInstUpdateDto {
  @JoiSchema(Joi.string().optional())
  userId?: string;

  @JoiSchema(Joi.string().max(96).optional())
  descr?: string;
}

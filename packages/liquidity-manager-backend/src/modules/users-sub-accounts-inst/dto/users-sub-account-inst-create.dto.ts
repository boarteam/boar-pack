import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class UsersSubAccountInstCreateDto {
  @JoiSchema(Joi.string().required())
  userId: string;

  @JoiSchema(Joi.string().max(96).required())
  descr: string;
}

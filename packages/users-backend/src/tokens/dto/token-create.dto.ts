import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';

export class TokenCreateDto {
  @JoiSchema(Joi.string().required())
  name: string;
}

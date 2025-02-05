import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';

export class TokenUpdateDto {
  @JoiSchema(Joi.string().optional())
  name?: string;
}

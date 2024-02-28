import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { Permissions, Roles } from '../entities/user.entity';

export class UserUpdateDto {
  @JoiSchema(Joi.string().optional())
  name?: string;

  @JoiSchema(Joi.string().trim().lowercase().email().optional())
  email?: string;

  @JoiSchema(
    Joi.string()
      .optional()
      .valid(...Object.values(Roles)),
  )
  role?: Roles;

  @JoiSchema(Joi.string().optional().allow(null))
  pass?: string | null;

  @JoiSchema(
    Joi.array().items(
      Joi
        .string()
        .valid(...Object.values(Permissions))
    ).optional(),
  )
  permissions?: Permissions[];
}

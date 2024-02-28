import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { Roles, Permissions } from '../entities/user.entity';

export class UserCreateDto {
  @JoiSchema(Joi.string().required())
  name: string;

  @JoiSchema(Joi.string().trim().lowercase().email().required())
  email: string;

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
        .required()
        .valid(...Object.values(Permissions))
    ).optional().default([]),
  )
  permissions?: Permissions[];
}

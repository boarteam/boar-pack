import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { Roles } from '../entities/user.entity';
import { Permission, Permissions } from "../entities/permissions";

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
      Joi.string()
    ).optional().default([]).custom((value: string[], helpers) => {
      value.forEach((permission) => {
        if (!Permissions.isValidPermission(permission as Permission)) {
          return helpers.error('any.invalid');
        }
      });

      return value;
    })
  )
  permissions?: Permission[];
}

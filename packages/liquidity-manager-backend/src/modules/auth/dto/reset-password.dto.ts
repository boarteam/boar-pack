import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class ResetPasswordDto {
  @JoiSchema(
    Joi.string()
      .min(8)
      .max(32)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).*$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must be at most 32 characters long',
        'string.pattern.base': 'Password must include an uppercase letter, a lowercase letter, a number, and a special character',
      })
  )
  password: string;
}

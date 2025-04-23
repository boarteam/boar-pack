import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';

export class TelegramSettingsUpdateDto {
  @JoiSchema(Joi.boolean().optional())
  enabled?: boolean;

  @JoiSchema(Joi.string().trim().optional().allow(''))
  botToken?: string;

  @JoiSchema(Joi.string().trim().optional().allow(''))
  chatId?: string;
}

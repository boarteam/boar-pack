import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class SubloginSettingsUpdateDto {
  @JoiSchema(Joi.string().optional())
  hedgeMultiplier?: string;

  @JoiSchema(Joi.number().integer().min(0).optional())
  spreadLimit?: number;

  @JoiSchema(Joi.string().optional())
  minVolumeForABook?: string;

  @JoiSchema(Joi.number().integer().min(0).optional())
  spreadLimitOnRollover?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  instrumentPriorityFlag?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  markupBid?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  markupAsk?: number;

  @JoiSchema(Joi.string().max(20).default('').optional())
  alias?: string;

  @JoiSchema(Joi.number().integer().min(0).optional())
  demi?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  dema?: number;

  @JoiSchema(Joi.string().optional())
  hedgeAmount?: string;

  @JoiSchema(Joi.string().optional())
  hedgeStep?: string;

  @JoiSchema(Joi.string().max(20).allow(null).optional())
  hedgeCurrency?: string;
}

import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnSubscrSchemaUpdateDto {
  @JoiSchema(Joi.number().integer().optional())
  connectSchemaId?: number;

  @JoiSchema(Joi.string().optional())
  instrumentHash?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  enabled?: number;

  @JoiSchema(Joi.number().integer().optional())
  markupBid?: number;

  @JoiSchema(Joi.number().integer().optional())
  defaultMarkupBid?: number;

  @JoiSchema(Joi.number().integer().optional())
  markupAsk?: number;

  @JoiSchema(Joi.number().integer().optional())
  defaultMarkupAsk?: number;

  @JoiSchema(Joi.string().alphanum().optional())
  minVolume?: string;

  @JoiSchema(Joi.string().alphanum().optional())
  maxVolume?: string;

  @JoiSchema(Joi.string().alphanum().optional())
  volumeStep?: string;

  @JoiSchema(Joi.number().integer().min(0).optional())
  instrumentWeight?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  executionMode?: number;

  @JoiSchema(Joi.string().max(512).allow(null).optional())
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  tradeEnabled?: number;
}

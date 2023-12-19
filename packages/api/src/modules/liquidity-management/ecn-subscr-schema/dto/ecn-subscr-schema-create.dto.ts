import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class EcnSubscrSchemaCreateDto {
  @JoiSchema(Joi.number().integer().required())
  connectSchema: number;

  @JoiSchema(Joi.string().required())
  instrument: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  enabled: number;

  @JoiSchema(Joi.number().integer().required())
  markupBid: number;

  @JoiSchema(Joi.number().integer().required())
  defaultMarkupBid: number;

  @JoiSchema(Joi.number().integer().required())
  markupAsk: number;

  @JoiSchema(Joi.number().integer().required())
  defaultMarkupAsk: number;

  @JoiSchema(Joi.string().alphanum().required())
  minVolume: string;

  @JoiSchema(Joi.string().alphanum().required())
  maxVolume: string;

  @JoiSchema(Joi.string().alphanum().required())
  volumeStep: string;

  @JoiSchema(Joi.number().integer().min(0).required())
  instrumentWeight: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  executionMode: number;

  @JoiSchema(Joi.string().max(512).allow(null).optional())
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  tradeEnabled: number;
}

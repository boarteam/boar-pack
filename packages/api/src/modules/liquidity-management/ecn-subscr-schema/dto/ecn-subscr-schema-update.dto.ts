import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { EcnExecutionMode } from '../entities/ecn-execution-mode.entity';

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

  @JoiSchema(Joi.string().optional())
  minVolume?: string;

  @JoiSchema(Joi.string().optional())
  maxVolume?: string;

  @JoiSchema(Joi.string().optional())
  volumeStep?: string;

  @JoiSchema(Joi.number().integer().min(0).optional())
  instrumentWeight?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  executionMode?: EcnExecutionMode['id'];

  @JoiSchema(Joi.string().max(512).allow(null).optional())
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  tradeEnabled?: number;
}

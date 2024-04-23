import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { EcnExecutionMode } from '../entities/ecn-execution-mode.entity';

export class EcnSubscrSchemaCreateDto {
  @JoiSchema(Joi.number().integer().required())
  connectSchemaId: number;

  @JoiSchema(Joi.string().required())
  instrumentHash: string;

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

  @JoiSchema(Joi.string().required())
  minVolume: string;

  @JoiSchema(Joi.string().required())
  maxVolume: string;

  @JoiSchema(Joi.string().required())
  volumeStep: string;

  @JoiSchema(Joi.number().integer().min(0).required())
  instrumentWeight: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  executionMode: EcnExecutionMode['id'];

  @JoiSchema(Joi.string().max(512).allow(null).optional())
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  tradeEnabled: number;
}

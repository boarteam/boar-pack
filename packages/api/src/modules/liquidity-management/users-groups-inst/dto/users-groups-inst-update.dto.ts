import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { DclAction } from '../../entities/dcl-action.entity';

export class UsersGroupsInstUpdateDto {
  @JoiSchema(Joi.number().integer().min(0).optional())
  ts?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  tsMs?: number;

  @JoiSchema(Joi.string().max(256).optional())
  name?: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).optional())
  action?: DclAction['id'];

  @JoiSchema(Joi.number().integer().min(0).optional())
  leverage?: number;

  @JoiSchema(Joi.string().optional())
  currencyId?: string;

  @JoiSchema(Joi.string().max(16).optional())
  currencyName?: string;

  @JoiSchema(Joi.string().max(96).allow(null).optional())
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).allow(null).optional())
  marginCall?: number;

  @JoiSchema(Joi.number().integer().min(0).allow(null).optional())
  marginStopout?: number;

  @JoiSchema(Joi.number().integer().optional())
  companyId?: number;

  @JoiSchema(Joi.number().integer().optional())
  type?: number;

  @JoiSchema(Joi.number().integer().optional())
  swapMode?: number;
}

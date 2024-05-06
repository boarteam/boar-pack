import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { UsersInstCompany } from '../../../entities/users-inst-company.entity';
import { EcnModule } from "../../ecn-modules/entities/ecn-module.entity";

export class UsersInstUpdateDto {
  @JoiSchema(Joi.number().integer().min(0).optional())
  ts?: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  tsMs?: number;

  @JoiSchema(Joi.string().max(256).optional())
  name?: string;

  @JoiSchema(Joi.string().max(128).optional())
  group?: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).optional())
  action?: number;

  @JoiSchema(Joi.number().integer().optional())
  leverage?: number;

  @JoiSchema(Joi.string().optional())
  balance?: string;

  @JoiSchema(Joi.string().optional())
  credit?: string;

  @JoiSchema(Joi.string().optional())
  margin?: string;

  @JoiSchema(Joi.string().optional())
  freeMargin?: string;

  @JoiSchema(Joi.string().optional())
  marginLevel?: string;

  @JoiSchema(Joi.string().max(256).optional().allow(''))
  userComment?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  enabled?: number;

  @JoiSchema(Joi.string().optional())
  profitloss?: string;

  @JoiSchema(Joi.string().optional())
  marginWithLimits?: string;

  @JoiSchema(Joi.string().optional())
  commission?: string;

  @JoiSchema(Joi.string().optional())
  swap?: string;

  @JoiSchema(Joi.string().optional())
  stopoutHash?: string;

  @JoiSchema(Joi.string().max(128).allow('').optional())
  stopoutName?: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  stopoutEnabled?: number;

  @JoiSchema(Joi.string().optional())
  stopoutSuppressTime?: string;

  @JoiSchema(Joi.string().optional())
  stopoutGenerationTime?: string;

  @JoiSchema(Joi.number().integer().optional())
  module?: EcnModule['id'];

  @JoiSchema(Joi.string().optional())
  password?: string;

  @JoiSchema(Joi.string().optional())
  commissionValue?: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).optional())
  commissionType?: number;

  @JoiSchema(Joi.number().integer().min(0).max(255).optional())
  commissionLotsMode?: number;

  @JoiSchema(Joi.string().optional())
  rolloverTime?: string;

  @JoiSchema(Joi.string().optional())
  commissionTurnover?: string;

  @JoiSchema(Joi.number().integer().optional())
  marginModule?: number;

  @JoiSchema(Joi.number().integer().optional())
  company?: UsersInstCompany['id'];

  @JoiSchema(Joi.number().integer().optional())
  trId?: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  fixTradingEnabled?: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  fixUserinfoRequestsEnabled?: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).optional())
  alwaysBookA?: number;

  @JoiSchema(Joi.string().optional())
  hedgeFactor?: string;
}

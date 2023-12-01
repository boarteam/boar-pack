import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { UsersInstCompany } from '../../entities/users-inst-company.entity';

export class UsersInstCreateDto {
  @JoiSchema(Joi.number().integer().min(0).required())
  ts: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  tsMs: number;

  @JoiSchema(Joi.string().max(256).required())
  name: string;

  @JoiSchema(Joi.string().max(128).required())
  group: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).required())
  action: number;

  @JoiSchema(Joi.number().integer().required())
  leverage: number;

  @JoiSchema(Joi.string().required())
  balance: string;

  @JoiSchema(Joi.string().required())
  credit: string;

  @JoiSchema(Joi.string().required())
  margin: string;

  @JoiSchema(Joi.string().required())
  freeMargin: string;

  @JoiSchema(Joi.string().required())
  marginLevel: string;

  @JoiSchema(Joi.string().max(256).optional().allow(''))
  userComment: string;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  enabled: number;

  @JoiSchema(Joi.string().required())
  profitloss: string;

  @JoiSchema(Joi.string().required())
  marginWithLimits: string;

  @JoiSchema(Joi.string().required())
  commission: string;

  @JoiSchema(Joi.string().required())
  swap: string;

  @JoiSchema(Joi.string().required())
  stopoutHash: string;

  @JoiSchema(Joi.string().max(128).required())
  stopoutName: string;

  @JoiSchema(Joi.number().integer().min(-1).required())
  userState: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  stopoutEnabled: number;

  @JoiSchema(Joi.string().required())
  stopoutSuppressTime: string;

  @JoiSchema(Joi.string().required())
  stopoutGenerationTime: string;

  @JoiSchema(Joi.number().integer().required())
  moduleId: number;

  @JoiSchema(Joi.string().optional())
  password: string;

  @JoiSchema(Joi.string().required())
  commissionValue: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).required())
  commissionType: number;

  @JoiSchema(Joi.number().integer().min(0).max(255).required())
  commissionLotsMode: number;

  @JoiSchema(Joi.string().optional())
  rolloverTime?: string;

  @JoiSchema(Joi.string().required())
  commissionTurnover: string;

  @JoiSchema(Joi.number().integer().required())
  marginModuleId: number;

  @JoiSchema(Joi.number().integer().optional())
  company?: UsersInstCompany['id'];

  @JoiSchema(Joi.number().integer().optional())
  trId?: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  fixTradingEnabled: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  fixUserinfoRequestsEnabled: number;

  @JoiSchema(Joi.number().integer().min(0).max(1).required())
  alwaysBookA: number;

  @JoiSchema(Joi.string().required())
  hedgeFactor: string;
}

import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { DclAction } from '../../entities/dcl-action.entity';
import { EcnWorkingMode } from '../../entities/ecn-working-modes.entity';
import { UsersInstCompany } from '../../entities/users-inst-company.entity';
import { EcnCurrency } from '../../entities/ecn-currency.entity';

export class UsersGroupsInstUpdateDto {
  @JoiSchema(Joi.string().max(256).optional())
  name: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).optional())
  action: DclAction['id'];

  @JoiSchema(Joi.number().integer().min(0).optional())
  leverage: number;

  @JoiSchema(Joi.string().max(16).optional())
  currency: EcnCurrency['name'];

  @JoiSchema(Joi.string().max(96).allow(null))
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).optional().allow(null))
  marginCall?: number;

  @JoiSchema(Joi.number().integer().min(0).optional().allow(null))
  marginStopout?: number;

  @JoiSchema(Joi.number().integer().optional())
  company: UsersInstCompany['id'];

  @JoiSchema(Joi.number().integer().min(0).optional())
  workingMode: EcnWorkingMode['id'];

  @JoiSchema(Joi.number().integer().optional())
  swapEnabled: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  ts: number;

  @JoiSchema(Joi.number().integer().min(0).optional())
  tsMs: number;
}

import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { DclAction } from '../../entities/dcl-action.entity';
import { EcnWorkingMode } from '../../entities/ecn-working-modes.entity';
import { UsersInstCompany } from '../../entities/users-inst-company.entity';
import { EcnCurrency } from '../../entities/ecn-currency.entity';

export class UsersGroupsInstCreateDto {
  @JoiSchema(Joi.string().max(256).required())
  name: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).required())
  action: DclAction['id'];

  @JoiSchema(Joi.number().integer().min(0).required())
  leverage: number;

  @JoiSchema(Joi.string().max(16).required())
  currency: EcnCurrency['name'];

  @JoiSchema(Joi.string().max(96).allow(null))
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).optional().allow(null))
  marginCall?: number;

  @JoiSchema(Joi.number().integer().min(0).optional().allow(null))
  marginStopout?: number;

  @JoiSchema(Joi.number().integer().required())
  company: UsersInstCompany['id'];

  @JoiSchema(Joi.number().integer().min(0).required())
  workingMode: EcnWorkingMode['id'];

  @JoiSchema(Joi.number().integer().required())
  swapEnabled: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  ts: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  tsMs: number;
}

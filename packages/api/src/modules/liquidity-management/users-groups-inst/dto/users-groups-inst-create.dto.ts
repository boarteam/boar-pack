import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { DclAction } from '../../entities/dcl-action.entity';

export class UsersGroupsInstCreateDto {
  @JoiSchema(Joi.number().integer().min(0).required())
  ts: number;

  @JoiSchema(Joi.number().integer().min(0).required())
  tsMs: number;

  @JoiSchema(Joi.string().max(256).required())
  name: string;

  @JoiSchema(Joi.number().integer().min(0).max(255).required())
  action: DclAction['id'];

  @JoiSchema(Joi.number().integer().min(0).required())
  leverage: number;

  @JoiSchema(Joi.string().regex(/\d+/, 'Only digits').required())
  currencyId: string;

  @JoiSchema(Joi.string().max(16).required())
  currencyName: string;

  @JoiSchema(Joi.string().max(96).allow(null))
  descr?: string;

  @JoiSchema(Joi.number().integer().min(0).optional().allow(null))
  marginCall?: number;

  @JoiSchema(Joi.number().integer().min(0).optional().allow(null))
  marginStopout?: number;

  @JoiSchema(Joi.number().integer().required())
  companyId: number;

  @JoiSchema(Joi.number().integer().required())
  type: number;

  @JoiSchema(Joi.number().integer().required())
  swapMode: number;
}

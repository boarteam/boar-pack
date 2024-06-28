import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class GetHistoryDatasQueryDto {
  @JoiSchema(Joi.string().allow('').optional())
  search?: string;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  limit?: number;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  offset?: number;

  @JoiSchema(Joi.array().items(Joi.string()).length(2).optional())
  sort?: [string, 'ASC' | 'DESC'];

  @JoiSchema(Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional())
  ids?: string[];

  @JoiSchema(Joi.alternatives().try(
    Joi.string().valid('Created', 'Deleted', 'Updated'), 
    Joi.array().items(Joi.string().valid('Created', 'Deleted', 'Updated')),
  ).optional())
  hactions?: string[];

  @JoiSchema(Joi.array().items(Joi.number()).length(2).optional())
  hts?: [number, number];
}

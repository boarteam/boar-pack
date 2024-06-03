import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class GetHistoryDatasQueryDto {
  @JoiSchema(Joi.string().allow('').optional())
  search?: string;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  limit?: number;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  page?: number;

  @JoiSchema(Joi.string().valid('ASC', 'DESC').optional())
  sortDirection?: 'ASC' | 'DESC';
}

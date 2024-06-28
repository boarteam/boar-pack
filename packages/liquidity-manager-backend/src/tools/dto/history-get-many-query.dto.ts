import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class GetHistoryDatasQueryDto {
  @JoiSchema(Joi.string().allow('').optional())
  search?: string;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  limit?: number;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  offset?: number;

  sort?: [string, 'ASC' | 'DESC'];

  ids?: string[];

  actions?: ('Created' | 'Deleted' | 'Updated')[];

  hts?: [number, number];
}

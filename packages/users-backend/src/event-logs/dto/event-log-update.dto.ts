import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { LogType, UserRole } from '../entities/event-log.entity';

export class EventLogUpdateDto {
  @JoiSchema(Joi.string().valid(...Object.values(LogType)).optional())
  logType?: LogType;

  @JoiSchema(Joi.string().optional())
  action?: string;

  @JoiSchema(Joi.string().optional())
  method?: string;

  @JoiSchema(Joi.string().uuid().allow(null).optional())
  userId?: string;

  @JoiSchema(Joi.string().valid(...Object.values(UserRole)).optional())
  userRole?: string;

  @JoiSchema(Joi.string().optional())
  entity?: string;

  @JoiSchema(Joi.string().uuid().allow(null).optional())
  entityId?: string;

  @JoiSchema(Joi.object().allow(null).optional())
  payload?: Record<string, any>;

  @JoiSchema(Joi.string().allow(null).optional())
  url?: string;

  @JoiSchema(Joi.string().allow(null).optional())
  ipAddress?: string;

  @JoiSchema(Joi.string().allow(null).optional())
  userAgent?: string;

  @JoiSchema(Joi.number().integer().allow(null).optional())
  duration?: number;

  @JoiSchema(Joi.number().integer().allow(null).optional())
  statusCode?: number;
}

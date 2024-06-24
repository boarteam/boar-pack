import { JoiSchema } from 'nestjs-joi';
import Joi from 'joi';
import { LogType, UserRole, LogLevel } from '../entities/event-log.entity';

export class EventLogCreateDto {
  @JoiSchema(Joi.string().valid(...Object.values(LogType)).required())
  logType: LogType;

  @JoiSchema(Joi.string().valid(...Object.values(LogLevel)).required())
  logLevel: LogLevel;

  @JoiSchema(Joi.string().required())
  action: string;

  @JoiSchema(Joi.string().optional())
  method?: string;

  @JoiSchema(Joi.string().uuid().allow(null).optional())
  userId?: string;

  @JoiSchema(Joi.string().valid(...Object.values(UserRole)).required())
  userRole: string;

  @JoiSchema(Joi.string().required())
  entity: string;

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

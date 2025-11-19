import Joi from "joi";
import { JoiSchema } from "nestjs-joi";

export class UsersConnectionsStatisticQueryDto {
  @JoiSchema(Joi.string().isoDate().optional())
  startTime?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  endTime?: string;

  @JoiSchema(Joi.string().optional())
  timezone?: string;
}

export class TargetsConnectionsStatisticQueryDto {
  @JoiSchema(Joi.string().isoDate().optional())
  startTime?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  endTime?: string;

  @JoiSchema(Joi.array().items(Joi.string()).required())
  targetIds: string[];
}

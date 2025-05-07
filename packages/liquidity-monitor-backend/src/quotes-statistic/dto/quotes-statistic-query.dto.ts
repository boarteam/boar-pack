import Joi from "joi";
import { JoiSchema } from "nestjs-joi";

export class QuotesStatisticQueryDto {
  @JoiSchema(Joi.string().isoDate().optional())
  startTime?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  endTime?: string;

  @JoiSchema(Joi.string().optional())
  timezone?: string;

  @JoiSchema(Joi.boolean().optional())
  upcoming?: boolean;
}

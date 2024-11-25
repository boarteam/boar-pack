import Joi from "joi";
import { JoiSchema } from "nestjs-joi";

export class PositionsQueryDto {
  @JoiSchema(Joi.string().required())
  userId: number;
}

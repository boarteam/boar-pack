import Joi from "joi";
import { JoiSchema } from "nestjs-joi";

export class InstrumentsHistoryQueryDto {
  // Format: "symbolName,ASC"
  @JoiSchema(Joi.string().optional())
  sort?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  start?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  end?: string;

  @JoiSchema(Joi.string().optional())
  s?: string;
}

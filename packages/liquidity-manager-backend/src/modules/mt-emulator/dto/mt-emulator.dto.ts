import { JoiSchema } from "nestjs-joi";
import Joi from "joi";
import { MTInstrument } from "../../amts-dc/dto/amts-dc.types";

export class Instrument {
  n: MTInstrument['n'];
  d: MTInstrument['d'];
  tm: MTInstrument['tm'];
  p: MTInstrument['p'];
  sh: MTInstrument['sh'];
}

export class EmulatorDto {
  @JoiSchema(Joi.number().positive().integer().optional())
  generatingInstruments?: number;

  @JoiSchema(Joi.array().items(Joi.string()).optional())
  problematicSymbols?: MTInstrument['n'][];
}

export class UpdateInstrumentDto {
  @JoiSchema(Joi.string().optional())
  n: Instrument['n'];

  @JoiSchema(Joi.string().optional())
  d: Instrument['d'];

  @JoiSchema(Joi.string().optional())
  tm: Instrument['tm'];

  @JoiSchema(Joi.string().optional())
  p: Instrument['p'];

  @JoiSchema(Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()))).optional())
  sh: Instrument['sh'];
}

export class CreateInstrumentDto {
  @JoiSchema(Joi.string().required())
  n: Instrument['n'];

  @JoiSchema(Joi.string().optional())
  d: Instrument['d'];

  @JoiSchema(Joi.string().optional())
  tm: Instrument['tm'];

  @JoiSchema(Joi.string().optional())
  p: Instrument['p'];

  @JoiSchema(Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()))).optional())
  sh: Instrument['sh'];
}

import { JoiSchema } from "nestjs-joi";
import Joi from "joi";
import { MTInstrument } from "../../amts-dc/dto/amts-dc.types";
import { PositionSide } from "../../positions/dto/positions.dto";
import { MTPosition } from "../../amts-dc/dto/amts-dc.dto";

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

export class GetPositionsDto {
  @JoiSchema(Joi.number().required())
  user_id: MTPosition['user_id'];
}

export class CreatePositionDto {
  @JoiSchema(Joi.number().required())
  user_id: MTPosition['user_id'];

  @JoiSchema(Joi.string().required())
  instrument: MTPosition['instrument'];

  @JoiSchema(Joi.string().valid(PositionSide.BUY, PositionSide.SELL).required())
  side: MTPosition['side'];

  @JoiSchema(Joi.number().required())
  amount: MTPosition['amount'];

  @JoiSchema(Joi.number().required())
  open_price: MTPosition['open_price'];

  @JoiSchema(Joi.number().required())
  margin: MTPosition['margin'];

  @JoiSchema(Joi.number().required())
  profit: MTPosition['profit'];
}

export class UpdatePositionDto {
  @JoiSchema(Joi.number().optional())
  user_id?: MTPosition['user_id'];

  @JoiSchema(Joi.string().optional())
  instrument?: MTPosition['instrument'];

  @JoiSchema(Joi.string().valid(PositionSide.BUY, PositionSide.SELL).optional())
  side?: MTPosition['side'];

  @JoiSchema(Joi.number().optional())
  amount?: MTPosition['amount'];

  @JoiSchema(Joi.number().optional())
  open_price?: MTPosition['open_price'];

  @JoiSchema(Joi.number().optional())
  margin?: MTPosition['margin'];

  @JoiSchema(Joi.number().optional())
  profit?: MTPosition['profit'];
}

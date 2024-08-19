import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { LiquidityManagersUserRoles } from "../entities/liquidity-managers-user.entity";

export class LiquidityManagersUserUpdateDto {
  @JoiSchema(Joi.string().uuid().optional())
  liquidityManagerId?: string;

  @JoiSchema(Joi.string().uuid().optional())
  userId?: string;

  @JoiSchema(Joi.string().valid(...Object.values(LiquidityManagersUserRoles)).optional())
  role?: LiquidityManagersUserRoles;
}

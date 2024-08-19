import Joi from "joi";
import { JoiSchema } from 'nestjs-joi';
import { LiquidityManagersUserRoles } from "../entities/liquidity-managers-user.entity";

export class LiquidityManagersUserCreateDto {
  @JoiSchema(Joi.string().uuid().required())
  liquidityManagerId: string;

  @JoiSchema(Joi.string().uuid().required())
  userId: string;

  @JoiSchema(Joi.string().valid(...Object.values(LiquidityManagersUserRoles)).required())
  role: LiquidityManagersUserRoles;
}

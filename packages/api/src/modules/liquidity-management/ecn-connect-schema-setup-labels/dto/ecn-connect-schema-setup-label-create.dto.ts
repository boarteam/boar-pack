import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { EcnModule } from '../../ecn-modules/entities/ecn-module.entity';

export class EcnConnectSchemaSetupLabelCreateDto {
  @JoiSchema(Joi.number().positive().integer().optional())
  id?: number;

  @JoiSchema(Joi.string().required())
  label: string;

  @JoiSchema(Joi.array().items(Joi.object({ id: Joi.number().integer().positive() })).required())
  modules: EcnModule['id'][];
}

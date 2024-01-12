import Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { EcnModule } from '../../ecn-modules/entities/ecn-module.entity';

export class EcnConnectSchemaSetupLabelUpdateDto {
  @JoiSchema(Joi.string().optional())
  label?: string;

  @JoiSchema(Joi.array().items(Joi.object({ id: Joi.number().integer().positive() })).optional())
  modules: EcnModule['id'][];
}

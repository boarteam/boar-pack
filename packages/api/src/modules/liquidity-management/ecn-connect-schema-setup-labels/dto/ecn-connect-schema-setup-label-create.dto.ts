import Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import { EcnModule } from '../../ecn-modules/entities/ecn-module.entity';

@JoiSchemaOptions({
  stripUnknown: true,
})
export class EcnConnectSchemaSetupLabelCreateDto {
  @JoiSchema(Joi.string().required())
  label: string;

  @JoiSchema(Joi.array().items(Joi.object({ id: Joi.number().integer().positive() })).required())
  modules: EcnModule['id'][];
}

import Joi from 'joi';
import { EcnInstrument } from '../entities/ecn-instrument.entity';
import { EcnConnectSchema } from '../../ecn-connect-schema/entities/ecn-connect-schema.entity';
import { JoiSchema } from 'nestjs-joi';
import {EcnInstrumentsGroup} from "../../ecn-instruments-groups/entities/ecn-instruments-group.entity";

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetInstrumentsInConnectionsQueryDto {
  @JoiSchema(Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.array().items(Joi.number().integer().positive())
  ).optional())
  id?: EcnConnectSchema['id'][] | EcnConnectSchema['id'];

  @JoiSchema(Joi.alternatives().try(
    Joi.string().alphanum(),
    Joi.array().items(Joi.string().alphanum())
  ).optional())
  filterInstrument?: EcnInstrument['instrumentHash'] | EcnInstrument['instrumentHash'][];

  @JoiSchema(Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.array().items(Joi.number().integer().positive())
  ).optional())
  filterInstrumentsGroup?: EcnInstrumentsGroup['id'] | EcnInstrumentsGroup['id'][];

  @JoiSchema(Joi.number().integer().positive().optional())
  compareConnectSchemaId?: EcnConnectSchema['id'];

  @JoiSchema(Joi.string().allow('').optional())
  search?: string;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  limit?: number;

  @JoiSchema(Joi.number().integer().positive().allow(0).optional())
  offset?: number;

  @JoiSchema(Joi.string().valid('ASC', 'DESC').optional())
  sortDirection?: SortDirection;

  @JoiSchema(Joi.boolean().optional())
  showOnlyChanged?: boolean;
}

export class GetEcnInstrumentsInConnectionsData {
  instrumentHash: EcnInstrument['instrumentHash'];
  instrumentName: EcnInstrument['name'];
  connections: Record<EcnConnectSchema['id'], { enabled: boolean, equal?: boolean }>;
}

export class GetEcnInstrumentsInConnectionsResponse {
  data: GetEcnInstrumentsInConnectionsData[];
  total: number;
}

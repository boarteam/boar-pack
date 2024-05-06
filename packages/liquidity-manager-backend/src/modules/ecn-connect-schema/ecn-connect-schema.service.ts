import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EcnConnectSchema } from './entities/ecn-connect-schema.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { AMTS_DB_NAME } from '../liquidity-app/liquidity-app.config';
import { CrudRequest } from '@nestjsx/crud';
import { EcnModule } from '../ecn-modules/entities/ecn-module.entity';

@Injectable()
export class EcnConnectSchemaService extends TypeOrmCrudService<EcnConnectSchema> {
  constructor(
    @InjectRepository(EcnConnectSchema, AMTS_DB_NAME)
    readonly repo: Repository<EcnConnectSchema>,
    @InjectDataSource(AMTS_DB_NAME)
    readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async createOne(req: CrudRequest, dto: DeepPartial<EcnConnectSchema>) {
    const { fromModuleId, toModuleId, descr } = dto;
    if (
      descr === undefined &&
      fromModuleId !== undefined &&
      toModuleId !== undefined
    ) {
      const modules = await this.dataSource
        .createQueryBuilder()
        .select('id')
        .addSelect('name')
        .from(EcnModule, 'modules')
        .where('id in (:...ids)', { ids: [fromModuleId, toModuleId] })
        .getRawMany();

      const modulesMap = modules.reduce((acc, module) => {
        acc[module.id] = module.name;
        return acc;
      }, {} as Record<EcnModule['id'], EcnModule['name']>);

      dto.descr = `${modulesMap[fromModuleId]} - ${modulesMap[toModuleId]}`;
    }

    return super.createOne(req, dto);
  }
}

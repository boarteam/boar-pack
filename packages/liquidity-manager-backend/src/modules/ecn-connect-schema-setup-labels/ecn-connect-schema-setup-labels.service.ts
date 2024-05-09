import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AMTS_DB_NAME } from '../liquidity-app/liquidity-app.config';
import { EcnConnectSchemaSetupLabel } from './entities/ecn-connect-schema-setup-label.entity';
import { QueryJoin } from '@nestjsx/crud-request/lib/types/request-query.types';
import { JoinOptions } from '@nestjsx/crud';
import { EcnModule } from '../ecn-modules/entities/ecn-module.entity';
import { EcnConnectSchema } from '../ecn-connect-schema/entities/ecn-connect-schema.entity';

@Injectable()
export class EcnConnectSchemaSetupLabelsService extends TypeOrmCrudService<EcnConnectSchemaSetupLabel> {
  constructor(
    @InjectRepository(EcnConnectSchemaSetupLabel, AMTS_DB_NAME)
    readonly repo: Repository<EcnConnectSchemaSetupLabel>,
    @InjectDataSource(AMTS_DB_NAME)
    readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  /**
   * The reason why we do not use usual relations is that we have to join with the same table multiple times. Using
   * standard relations would result in poor performance.
   */
  protected setJoin(
    cond: QueryJoin,
    joinOptions: JoinOptions,
    builder: SelectQueryBuilder<EcnConnectSchemaSetupLabel>,
  ) {
    if (cond.field === 'modules.connections') {
      builder.innerJoin(
        'ecn_connect_schema',
        'modulesConnections',
        'modulesConnections.fromModuleId = modules.id OR modulesConnections.toModuleId = modules.id',
      );
      return false;
    } else if (cond.field === 'modules.connections.subscrSchemas') {
      builder.innerJoin(
        'ecn_subscr_schema',
        'modulesConnectionsSubscrSchemas',
        'modulesConnectionsSubscrSchemas.connectSchemaId = modulesConnections.id',
      );
      return false;
    }

    return super.setJoin(cond, joinOptions, builder);
  }

  async generateSetups() {
    const [modules, connectSchemas, lastSetupLabelId] = await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .select('id')
        .from(EcnModule, 'modules')
        .where('id != 1')
        .getRawMany<{ id: EcnModule['id'] }>(),
      this.dataSource
        .createQueryBuilder()
        .select('id')
        .addSelect('from_moduleid')
        .addSelect('to_moduleid')
        .from(EcnConnectSchema, 'connectSchemas')
        .where('from_moduleid != 1')
        .andWhere('to_moduleid != 1')
        .getRawMany<{
          id: EcnConnectSchema['id'];
          from_moduleid: EcnConnectSchema['fromModuleId'];
          to_moduleid: EcnConnectSchema['toModuleId'];
        }>(),
      this.dataSource
        .createQueryBuilder()
        .select('max(id)', 'lastSetupLabelId')
        .from(EcnConnectSchemaSetupLabel, 'connectSchemaSetupLabels')
        .getRawOne<{ lastSetupLabelId: string }>()
        .then((result) => Number(result?.lastSetupLabelId ?? 0)),
    ]);

    const connectSchemasMap: Record<EcnConnectSchema['id'], EcnModule['id'][]> =
      {};
    const modulesMap = modules.reduce((acc, module) => {
      acc[module.id] = [];
      return acc;
    }, {} as Record<EcnModule['id'], EcnConnectSchema['id'][]>);

    for (const { id, from_moduleid, to_moduleid } of connectSchemas) {
      connectSchemasMap[id] = [to_moduleid, from_moduleid];
      modulesMap[from_moduleid].push(id);
      modulesMap[to_moduleid].push(id);
    }

    const visitedModules = new Set<EcnModule['id']>();
    const modulesGroups: { id: EcnModule['id'] }[][] = [[]];

    for (const { id: baseModuleId } of modules) {
      if (visitedModules.has(baseModuleId)) continue;

      const newVisitedModules: { id: EcnModule['id'] }[] = [];
      const modulesToVisit: EcnModule['id'][] = [baseModuleId];

      for (
        let moduleId = modulesToVisit.pop();
        moduleId !== undefined;
        moduleId = modulesToVisit.pop()
      ) {
        newVisitedModules.push({ id: moduleId });
        visitedModules.add(moduleId);

        for (const connectSchemaId of modulesMap[moduleId]) {
          for (const moduleId of connectSchemasMap[connectSchemaId]) {
            if (!visitedModules.has(moduleId)) {
              modulesToVisit.push(moduleId);
            }
          }
        }
      }

      if (newVisitedModules.length > 1) {
        modulesGroups.push(newVisitedModules);
      } else {
        modulesGroups[0].push(newVisitedModules[0]);
      }
    }

    await Promise.all(
      modulesGroups.map((modules, index) => {
        return this.repo.save({
          label: `Setup ${lastSetupLabelId + index + 1}`,
          modules,
        });
      }),
    );
  }
}

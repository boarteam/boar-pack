import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ViewInstrumentsSpecification } from './entities/view-instruments-specifications.entity';

@Injectable()
export class ViewInstrumentsSpecificationsService extends TypeOrmCrudService<ViewInstrumentsSpecification> {}

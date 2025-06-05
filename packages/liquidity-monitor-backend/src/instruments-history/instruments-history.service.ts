import { Injectable } from '@nestjs/common';
import { InstrumentsHistory } from "./entities/instruments-history.entity";
import { Repository } from "typeorm";

@Injectable()
export class InstrumentsHistoryService {

  constructor(
    private readonly repo: Repository<InstrumentsHistory>,
  ) {}
}

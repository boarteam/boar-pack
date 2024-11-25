import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Put,
  Query
} from "@nestjs/common";
import { MtEmulatorService } from "./mt-emulator.service";
import {
  CreateInstrumentDto,
  CreatePositionDto,
  EmulatorDto, GetPositionsDto,
  Instrument,
  UpdateInstrumentDto, UpdatePositionDto
} from "./dto/mt-emulator.dto";
import {
  MTInstrumentListRequest,
  MTInstrumentListShortRequest, MTPosition,
  MTGetPositionsRequest
} from "../amts-dc/dto/amts-dc.dto";

type TRequest =
  | MTInstrumentListRequest
  | MTInstrumentListShortRequest
  | MTGetPositionsRequest

@Controller()
export class MtEmulatorController {
  private readonly logger = new Logger(MtEmulatorController.name);

  constructor(
    private readonly service: MtEmulatorService,
  ) {}

  @Post()
  async handle(@Body() request: TRequest) {
    console.log(request);
    this.logger.log(`Request to ${request.method}`);
    switch (request.method) {
      case 'req_instrument_list':
        return {
          result: {
            instruments: this.service.generateInstruments(),
          }
        }
      case 'get_positions':
        return {
          positions: this.service.generatePositions()
        }
    }

    this.logger.log(request);
    throw new NotImplementedException('Not implemented');
  }

  @Post('emulator/stop')
  async stop(): Promise<void> {
    this.service.stop();
  }

  @Post('emulator/start')
  async start(): Promise<void> {
    this.service.start();
  }

  @Patch('emulator')
  async changeSettings(
    @Body() settings: EmulatorDto,
  ): Promise<void> {
    this.service.changeSettings(settings);
  }

  @Post('emulator/instrument')
  async addInstrument(
    @Body() instrument: CreateInstrumentDto,
  ): Promise<void> {
    this.service.createInstrument(instrument);
  }

  @Post('emulator/instruments')
  async addInstruments(
    @Body() instruments: CreateInstrumentDto[],
  ): Promise<void> {
    instruments.forEach((instrument) => this.service.createInstrument(instrument));
  }

  @Put('emulator/instrument/:symbol')
  async updateInstrument(
    @Param('symbol') symbol: Instrument['n'],
    @Body() instrument: UpdateInstrumentDto,
  ): Promise<void> {
    this.service.updateInstrument(symbol, instrument);
  }

  @Delete('emulator/instrument/:symbol')
  async deleteInstrument(
    @Param('symbol') symbol: Instrument['n'],
  ): Promise<void> {
    this.service.deleteInstrument(symbol);
  }

  @Get('emulator/position')
  async getPositions(
      @Query() params: GetPositionsDto,
  ): Promise<{ position: MTPosition }[]> {
    return this.service.getPositions(params);
  }

  @Post('emulator/position')
  async addPosition(
      @Body() position: CreatePositionDto,
  ): Promise<void> {
    this.service.createPosition(position);
  }

  @Post('emulator/positions')
  async addPositions(
      @Body() positions: CreatePositionDto[],
  ): Promise<void> {
    positions.forEach((position) => this.service.createPosition(position));
  }

  @Put('emulator/position/:id')
  async updatePosition(
      @Param('id') id: MTPosition['id'],
      @Body() position: UpdatePositionDto,
  ): Promise<void> {
    this.service.updatePosition(id, position);
  }

  @Delete('emulator/position/:id')
  async deletePosition(
      @Param('id') id: MTPosition['id'],
  ): Promise<void> {
    this.service.deletePosition(id);
  }
}

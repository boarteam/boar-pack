import { Body, Controller, Delete, Logger, NotImplementedException, Param, Patch, Post, Put } from "@nestjs/common";
import { MtEmulatorService } from "./mt-emulator.service";
import { CreateInstrumentDto, EmulatorDto, Instrument, UpdateInstrumentDto } from "./dto/mt-emulator.dto";
import { MTInstrumentListRequest, MTInstrumentListShortRequest } from "../amts-dc/dto/amts-dc.dto";

type TRequest =
  | MTInstrumentListRequest
  | MTInstrumentListShortRequest;

@Controller()
export class MtEmulatorController {
  private readonly logger = new Logger(MtEmulatorController.name);

  constructor(
    private readonly service: MtEmulatorService,
  ) {}

  @Post()
  async handle(@Body() request: TRequest) {
    this.logger.log(`Request to ${request.method}`);
    switch (request.method) {
      case 'req_instrument_list':
        return {
          result: {
            instruments: this.service.generateInstruments(),
          }
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
}

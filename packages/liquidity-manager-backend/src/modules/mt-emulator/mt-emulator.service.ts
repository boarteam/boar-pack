import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import {
  BehaviorSubject,
  concat,
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  range,
  share,
  switchMap,
  tap,
  timer
} from "rxjs";
import { CreatePositionDto, EmulatorDto, GetPositionsDto, Instrument, UpdatePositionDto } from "./dto/mt-emulator.dto";
import { MtEmulatorGateway } from "./mt-emulator.gateway";
import {MTPosition, MTPositionsWSMessage, MTQuoteWSMessage} from "../amts-dc/dto/amts-dc.dto";
import { MTInstrument } from "../amts-dc/dto/amts-dc.types";
import { PositionDto, PositionSide } from "../positions/dto/positions.dto";

@Injectable()
export class MtEmulatorService {
  private readonly logger = new Logger(MtEmulatorService.name);
  private readonly DELAY = 1000;
  private readonly generator: Observable<string>;
  private readonly positionsGenerator: Observable<string>;
  private running = new BehaviorSubject<boolean>(true);
  private generatingInstruments = new BehaviorSubject<number>(10);
  private problematicSymbols = new BehaviorSubject(new Set<Instrument['n']>());
  private addedInstruments = new BehaviorSubject(new Map<Instrument['n'], Instrument>());
  private removedInstruments = new BehaviorSubject(new Set<Instrument['n']>());
  private pathsForInstruments = new Map<Instrument['n'], string>();
  private positions: { position: MTPosition }[];

  constructor(
    @Inject(forwardRef(() => MtEmulatorGateway))
    private readonly gateway: MtEmulatorGateway,
  ) {
    this.generator = this.running.pipe(
      switchMap(start => {
        if (start) {
          return timer(0, this.DELAY).pipe(
            tap(() => {
              this.logger.debug(`Generating ${this.generatingInstruments.value + this.addedInstruments.value.size} quotes every ${this.DELAY}ms`);
            }),
            concatMap(() => {
              return concat(
                range(this.generatingInstruments.value).pipe(map(i => `I${i}`)),
                from(this.addedInstruments.value.keys()),
              );
            }),
            filter(symbol => !this.removedInstruments.value.has(symbol) && !this.problematicSymbols.value.has(symbol)),
            map(symbol => {
              const d = Math.random() - 0.5;
              return JSON.stringify({
                quote: {
                  bands: {
                    prices: [123.4567 - d, 123.1234 - d],
                    volumes: [-1, 1],
                  },
                  ask: 123.4567 - d,
                  bid: 123.1234 - d,
                  instrument: symbol,
                  ts_msc: Date.now(),
                },
              } as MTQuoteWSMessage);
            })
          );
        } else {
          return EMPTY;
        }
      }),
      share()
    );

    this.addedInstruments.next(new Map([[
      '#AA',
      {
        n: '#AA',
        d: 4,
        p: 'Test\\Group\\#AA',
        tm: 0,
        sh: Array.from({ length: 7 }, () => {
          const intervals = [];
          for (let i = 0; i < 24 * 60; ++i) {
            if (Math.random() < 0.3) {
              intervals.push([i, i + 1])
            }
          }
          return intervals;
        }),
      }
    ]]));

    this.positions = this.generatePositions();
    this.positionsGenerator = new Observable<string>((subscriber) => {
        setInterval(() => {
            // Generate random index between 0 and positions.length numbers
            const index = Math.floor(Math.random() * (this.positions.length - 1));
            const position = this.positions[index].position;
            const d = Math.random() - 0.5;

            position.side = Math.random() > 0.5 ? PositionSide.BUY : PositionSide.SELL;
            position.amount -= d;
            position.open_price -= d * 10;
            position.margin += d * 10;
            position.user_id = 707;
            position.ts_update = new Date().getTime();

            const message = JSON.stringify({
                position,
            } as MTPositionsWSMessage);

            subscriber.next(message);
        }, this.DELAY);
    })
  }

  public start(): void {
    this.logger.log('Started generating instruments');
    this.running.next(true);
  }

  public stop(): void {
    this.logger.log('Stopped generating instruments');
    this.running.next(false);
  }

  public changeSettings(settings: EmulatorDto): void {
    this.logger.log('Changing settings to', settings);
    const prevGeneratingInstruments = this.generatingInstruments.value;
    const { generatingInstruments, problematicSymbols } = settings;
    if (generatingInstruments !== undefined) {
      const diff = generatingInstruments - prevGeneratingInstruments;
      if (diff > 0) {
        for (let i = prevGeneratingInstruments; i < prevGeneratingInstruments + diff; ++i) {
          this.gateway.broadcast(
            JSON.stringify({
              symbol_add: {
                n: `I${i}`,
                d: 4,
                tm: i % 5,
                p: 'Test\\Group\\I1',
                sh: Array.from({ length: 7 }, () => {
                  const intervals = [];
                  for (let i = 0; i < 24 * 60; ++i) {
                    if (Math.random() < 0.3) {
                      intervals.push([i, i + 1])
                    }
                  }
                  return intervals;
                }),
              },
            })
          )
        }
        this.generatingInstruments.next(generatingInstruments);
      } else {
        this.generatingInstruments.next(generatingInstruments);
        for (let i = prevGeneratingInstruments - 1; i >= prevGeneratingInstruments + diff; --i) {
          this.gateway.broadcast(
            JSON.stringify({
              symbol_delete: {
                n: `I${i}`,
              },
            })
          )
        }
      }
    }
    if (problematicSymbols !== undefined) {
      this.problematicSymbols.next(new Set(problematicSymbols));
    }
  }

  public createInstrument(instrument: Instrument): void {
    this.gateway.broadcast(JSON.stringify({
      symbol_add: instrument,
    }));
    this.removedInstruments.value.delete(instrument.n);
    this.addedInstruments.value.set(instrument.n, instrument);
    this.removedInstruments.next(this.removedInstruments.value);
    this.addedInstruments.next(this.addedInstruments.value);
    this.logger.log('Added instrument', instrument);
  }

  public updateInstrument(symbol: Instrument['n'], instrument: Instrument): void {
    this.gateway.broadcast(JSON.stringify({
      symbol_update: instrument,
    }));
    this.removedInstruments.value.delete(symbol);
    this.removedInstruments.next(this.removedInstruments.value);
    this.addedInstruments.value.delete(symbol);
    this.addedInstruments.value.set(instrument.n, instrument);
    this.addedInstruments.next(this.addedInstruments.value);
    this.logger.log(`Updated instrument ${symbol}`, instrument);
  }

  public deleteInstrument(symbol: Instrument['n']): void {
    const instrument = this.addedInstruments.value.get(symbol);
    this.addedInstruments.value.delete(symbol);
    this.addedInstruments.next(this.addedInstruments.value);
    this.removedInstruments.value.add(symbol);
    this.removedInstruments.next(this.removedInstruments.value);
    this.gateway.broadcast(JSON.stringify({
      symbol_delete: instrument,
    }));
    this.logger.log(`Deleted instrument ${symbol}`);
  }

  public getQuotesStream(): Observable<string> {
    return this.generator;
  }

  public getPositionsStream(): Observable<string> {
      return this.positionsGenerator;
  }

  private getPathForInstrument(symbol: string): string {
    let path = this.pathsForInstruments.get(symbol);

    if (!path) {
      const randomI = Math.floor(Math.random() * 3);
      path = `Test\\Group${randomI}\\${symbol}`;
      this.pathsForInstruments.set(symbol, `Test\\Group${randomI}\\${symbol}`);
    }

    return path;
  }

  generateInstruments() {
    const t: Partial<MTInstrument> = {
      d: 4,
      p: '',
    };

    return Array.from({
      length: this.generatingInstruments.value,
    })
      .map((_, i) => ({
        ...t,
        n: `I${i}`,
        tm: i % 5,
        p: this.getPathForInstrument(`I${i}`),
        // sh: [[], [], [], [], [], [], []],
        sh: Array.from({ length: 7 }, () => {
          const intervals = [];
          for (let i = 0; i < 24 * 60; ++i) {
            if (Math.random() < 0.3) {
              intervals.push([i, i + 1])
            }
          }
          return intervals;
        }),
      }))
      .concat(Array.from(this.addedInstruments.value.values()))
      .filter(({ n }) => !this.removedInstruments.value.has(n));
  }

  generatePositions(): { position: MTPosition }[] {
    const instruments = ['BTCEUR', 'EURAUD', 'EURCAD', 'EURCHF', 'EURCHF1', 'EURCHF2', 'EURCHF3', 'EURCZK', 'EURHKD', 'EURHUF'];
    return Array.from({
      length: instruments.length,
    })
        .map((_, i) => {
          const amount = Math.random() * 1000;
          return {
            position: {
              id: i + 1,
              user_id: 0,
              instrument: instruments[i],
              side: Math.random() > 0.5 ? PositionSide.BUY : PositionSide.SELL,
              amount,
              open_price: Math.random() * 100 + 1,
              margin: (amount * 0.1),
              profit: (Math.random() - 0.5) * 200,
              ts_create: new Date().getTime(),
              ts_update: new Date().getTime(),
            }
          };
        });
  }

  public getPositions(params: GetPositionsDto): { position: MTPosition }[] {
      const {user_id} = params;
      return this.positions.map(({position}) => ({
          position: {
              ...position,
              user_id
          }
      }));
  }

  public createPosition(position: CreatePositionDto): void {
    const lastIndex = this.positions.length - 1;
    this.positions.push({
      position: {
        id: +this.positions[lastIndex].position.id + 1,
        ts_create: new Date().getTime(),
        ts_update: new Date().getTime(),
        ...position
      }
    });
    this.gateway.broadcast(JSON.stringify({
      position: position,
    }));
    this.logger.log('Added position', position);
  }

  public updatePosition(id: PositionDto['id'], position: UpdatePositionDto): void {
    const item = this.positions.find(({ position }) => position.id === +id);

    if (item) {
      item.position = {
        ...item.position,
        ...position
      }

      this.gateway.broadcast(JSON.stringify({
        position: item.position,
      }));
      this.logger.log(`Updated position ${id}`);
    }
  }

  public deletePosition(id: PositionDto['id']): void {
    const index = this.positions.findIndex(({ position }) => position.id === +id);

    if (index !== -1) {
      this.positions[index].position.amount = 0;
      this.gateway.broadcast(JSON.stringify({
        position: this.positions[index].position,
      }));
      this.logger.log(`Deleted position ${id}`);
    }
  }
}

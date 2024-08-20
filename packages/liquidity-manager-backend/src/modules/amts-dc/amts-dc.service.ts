import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { parse } from "lossless-json";
import {
  MTAttachStreamRequest,
  MTGetPositionsRequest,
  MTGetPositionsResult,
  MTInstrumentListRequest,
  MTInstrumentListResult,
  MTResponse,
  MTWSMessage
} from "./dto/amts-dc.dto";
import WebSocket from "ws";
import {
  TBaseConfig,
  WebsocketsClients
} from "@jifeon/boar-pack-common-backend/src/modules/websockets/websockets.clients";
import { AmtsDcConfigService } from "./amts-dc.config";

type TAmtsSocketsConfig = TBaseConfig<MTWSMessage> & {
  // instruments: string[];
}

@Injectable()
export class AmtsDcService {
  private readonly logger = new Logger(AmtsDcService.name);
  private readonly VERSION = 10;
  private readonly config = this.configService.config;

  constructor(
    private httpService: HttpService,
    private readonly configService: AmtsDcConfigService,
    private readonly websocketsClients: WebsocketsClients<
      MTWSMessage,
      MTAttachStreamRequest,
      TAmtsSocketsConfig
    >,
  ) {
  }

  public getUrl(serverId: string): string {
    // noinspection HttpUrlsUsage
    const params = new URLSearchParams({
      server_id: serverId,
      web_api_login: this.config.webApiLogin,
      web_api_pass: this.config.webApiPass,
    });
    return `http://amts-tst-srv-01:3000/?${params.toString()}`;
    // return `http://localhost:4300/`;
  }

  public async request<TReq extends { method: string }, TRes>(url: string, params: TReq): Promise<TRes> {
    this.logger.log(`Request to ${url}, method: ${params.method}`);
    this.logger.verbose(params);
    const response = await this.httpService.axiosRef.post<TRes>(url, params, {
      // transformResponse: (data: any) => {
      //   return parse(data);
      // }
    });

    return response.data;
  }

  public async getInstruments(url: string) {
    const params = {
      method: 'req_instrument_list',
      version: this.VERSION,
    } as const;

    return this.request<MTInstrumentListRequest, MTInstrumentListResult>(url, params);
  }

  public async getPositions({
    userId,
    serverId,
  }:{
    userId: number,
    serverId: string,
  }) {
    const params = {
      method: 'get_positions',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    } as const;

    return this.request<MTGetPositionsRequest, MTGetPositionsResult>(this.getUrl(serverId), params);
  }

  public checkStreamConnection({
    url,
    // instruments,
  }: Pick<TAmtsSocketsConfig, 'url'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = this.websocketsClients.connect({
        url,
        // instruments,
        onOpen: () => {
          this.websocketsClients.close(ws).then(resolve).catch(reject);
        },
        onClose: () => {
          reject(new Error('Connection closed'));
        }
      });
    });
  }

  public createQuotesWebsocketAndAttachStream({
    url,
    instruments,
    options,
    onOpen,
    onMessage,
    onClose,
  }: {
    url: string,
    instruments: string[],
    options?: Partial<MTAttachStreamRequest>,
    onOpen?: () => void;
    onMessage?: (event: MTWSMessage) => void;
    onClose?: () => void;
  }): WebSocket {
    const ws = this.websocketsClients.connect({
      url,
      ignoreInvalidJson: true,
      onOpen: () => {
        onOpen?.();
        return this.attachStream({
          ws,
          instruments,
          options,
        });
      },
      onMessage,
      onClose,
    });

    return ws;
  }

  public closeQuotesWebsocket(ws: WebSocket): Promise<void> {
    return this.websocketsClients.close(ws);
  }

  public async attachStream({
    ws,
    instruments,
    options,
  }: {
    ws: WebSocket,
    instruments: string[],
    options?: Partial<MTAttachStreamRequest>
  }): Promise<void> {
    const params: MTAttachStreamRequest = {
      method: 'attach_stream',
      version: this.VERSION,
      req_id: 1,
      subscribe_quotes: instruments,
      quotes_timeout: 1000,
      ...options,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending attach_stream request`);

    await this.websocketsClients.send(ws, params)
  }

  public detachStream({
    ws,
    instruments,
  }: {
    ws: WebSocket,
    instruments: string[],
  }): Promise<void> {
    const params = {
      method: 'detach_stream',
      version: this.VERSION,
      req_id: 1,
      unsubscribe_quotes: instruments,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending detach_stream request`);
    return this.websocketsClients.send(ws, params);
  }
}


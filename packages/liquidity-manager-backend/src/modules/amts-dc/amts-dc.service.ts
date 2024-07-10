import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import crypto from 'crypto';
import { LosslessNumber, parse } from "lossless-json";
import {
  MTAttachStreamRequest,
  MTInstrumentListRequest,
  MTInstrumentListResult,
  MTLoginRequest,
  MTLoginResult,
  MTResponse, MTWSMessage
} from "./dto/amts-dc.dto";
import WebSocket from "ws";
import {
  TBaseConfig,
  WebsocketsClients
} from "@jifeon/boar-pack-common-backend/src/modules/websockets/websockets.clients";

type TAmtsSocketsConfig = TBaseConfig<MTWSMessage> & {
  // instruments: string[];
}

@Injectable()
export class AmtsDcService {
  private readonly logger = new Logger(AmtsDcService.name);
  private readonly VERSION = 10;


  constructor(
    private httpService: HttpService,
    private readonly websocketsClients: WebsocketsClients<
      MTWSMessage,
      MTAttachStreamRequest,
      TAmtsSocketsConfig
    >,
  ) {
  }

  public async request<TReq extends { method: string }, TRes>(url: string, params: TReq): Promise<MTResponse<TRes>['result']> {
    this.logger.log(`Request to ${url}, method: ${params.method}`);
    const response = await this.httpService.axiosRef.post<MTResponse<TRes>>(url, params, {
      transformResponse: (data: any) => {
        return parse(data);
      }
    });

    const result = response.data.result;
    if (result.status === false) {
      this.logger.error(`Error while requesting ${url}, method: ${params.method}`);
      this.logger.error(result);
      throw new Error(result.description);
    }

    return response.data.result;
  }

  public async auth(url: string, params: Omit<MTLoginRequest, 'method'>) {
    return this.request<MTLoginRequest, MTLoginResult>(url, {
      method: 'req_login',
      version: this.VERSION,
      ...params,
    });
  }


  private calculateSecret(data: Record<string, string | number | string[]>, sessionId: LosslessNumber, pin: LosslessNumber): string {
    const sortedKeys = Object.keys(data).sort();
    const keyValueString = sortedKeys.map(key => {
      let value = data[key];
      if (Array.isArray(value)) {
        value = value.join('');
      }
      return `${key}=${value}`;
    }).join('');

    const hashingString = keyValueString
      + sessionId.toString()
      + pin.toString();

    return crypto
      .createHash('sha1')
      .update(hashingString)
      .digest('hex');
  }

  public async getInstruments(url: string, auth: MTLoginResult) {
    const params = {
      method: 'req_instrument_list',
      version: this.VERSION,
      session_id: Number(auth.session_id),
    } as const;

    return this.request<MTInstrumentListRequest, MTInstrumentListResult>(url, {
      ...params,
      secret: this.calculateSecret(params, auth.session_id, auth.pin),
    });
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
    auth,
    instruments,
    options,
    onMessage,
    onClose,
  }: {
    url: string,
    auth: MTLoginResult,
    instruments: string[],
    options?: Partial<MTAttachStreamRequest>
    onMessage?: (event: MTWSMessage) => void;
    onClose?: () => void;
  }): WebSocket {
    const ws = this.websocketsClients.connect({
      url,
      ignoreInvalidJson: true,
      onOpen: () => {
        return this.attachStream({
          ws,
          auth,
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
    auth,
    instruments,
    options,
  }: {
    ws: WebSocket,
    auth: MTLoginResult,
    instruments: string[],
    options?: Partial<MTAttachStreamRequest>
  }): Promise<void> {
    const params: MTAttachStreamRequest = {
      method: 'attach_stream',
      version: this.VERSION,
      session_id: Number(auth.session_id),
      req_id: 1,
      subscribe_quotes: instruments,
      quotes_timeout: 1000,
      ...options,
    };

    const data = {
      ...params,
      secret: this.calculateSecret(params, auth.session_id, auth.pin),
    };

    this.logger.verbose(data);
    this.logger.log(`Sending attach_stream request`);

    await this.websocketsClients.send(ws, data)
  }

  public detachStream({
    ws,
    auth,
    instruments,
  }: {ws: WebSocket, auth: MTLoginResult, instruments: string[]}): Promise<void> {
    const params = {
      method: 'detach_stream',
      version: this.VERSION,
      session_id: Number(auth.session_id),
      req_id: 1,
      unsubscribe_quotes: instruments,
    };

    const data = {
      ...params,
      secret: this.calculateSecret(params, auth.session_id, auth.pin),
    };

    this.logger.verbose(data);
    this.logger.log(`Sending detach_stream request`);
    return this.websocketsClients.send(ws, data);
  }
}


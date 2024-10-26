import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { isSafeNumber, parse } from "lossless-json";
import {
  MTSubscribeToQuotesRequest,
  MTGetPositionsRequest,
  MTGetPositionsResult,
  MTGetUserInfoRequest, MTGetUserInfoResult, MTUserInfo,
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
      MTSubscribeToQuotesRequest,
      TAmtsSocketsConfig
    >,
  ) {
  }

  public getHttpUrl(serverId: number): string {
    const params = new URLSearchParams({
      server_id: String(serverId),
      web_api_login: this.config.webApiLogin,
      web_api_pass: this.config.webApiPass,
    });
    return `${this.config.httpBaseUrl}/?${params.toString()}`;
  }

  public getWsUrl(serverId: string | number): string {
    const params = new URLSearchParams({
      server_id: String(serverId),
      web_api_login: this.config.webApiLogin,
      web_api_pass: this.config.webApiPass,
    });
    return `${this.config.wsBaseUrl}?${params.toString()}`;
  }

  private toSafeNumberOrString(value: string): number | string {
    return isSafeNumber(value) ? parseFloat(value) : value;
  }

  public async request<TReq extends { method: string }, TRes>(url: string, params: TReq): Promise<TRes> {
    this.logger.log(`Request to ${url}, method: ${params.method}`);
    this.logger.verbose(params);
    const response = await this.httpService.axiosRef.post<TRes>(url, params, {
      transformResponse: (data: any) => {
        return parse(data, null, this.toSafeNumberOrString);
      }
    });

    return response.data;
  }

  public getPositions({
    userId,
    serverId,
  }: {
    userId: number,
    serverId: number,
  }) {
    const params = {
      method: 'get_positions',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    } as const;

    return this.request<MTGetPositionsRequest, MTGetPositionsResult>(this.getHttpUrl(serverId), params);
  }

  public getUserInfo({
    userId,
    serverId,
  }: {
    userId: number,
    serverId: number,
  }) {
    const params = {
      method: 'get_user',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    } as const;

    return this.request<MTGetUserInfoRequest, MTGetUserInfoResult>(this.getHttpUrl(serverId), params);
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

  public connectWebsocket({
    url,
    onOpen,
    onMessage,
    onClose,
  }: {
    url: string,
    onOpen?: () => void;
    onMessage?: (event: MTWSMessage) => void;
    onClose?: () => void;
  }): WebSocket {
    return this.websocketsClients.connect({
      url,
      ignoreInvalidJson: true,
      onOpen,
      onMessage,
      onClose,
    });
  }

  public closeWebsocket(ws: WebSocket): Promise<void> {
    return this.websocketsClients.close(ws);
  }

  public async subscribeToQuotesStream({
    ws,
    instruments,
    options,
  }: {
    ws: WebSocket,
    instruments: string[],
    options?: Partial<MTSubscribeToQuotesRequest>
  }): Promise<void> {
    const params: MTSubscribeToQuotesRequest = {
      method: 'subscribe_to_quotes_stream',
      version: this.VERSION,
      req_id: 1,
      instruments,
      quotes_timeout: 1000,
      ...options,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending subscribe_to_quotes_stream request`);

    await this.websocketsClients.send(ws, params)
  }

  public unsubscribeFromQuotesStream({
    ws,
    instruments,
  }: {
    ws: WebSocket,
    instruments: string[],
  }): Promise<void> {
    const params = {
      method: 'unsubscribe_from_quotes_stream',
      version: this.VERSION,
      req_id: 1,
      instruments,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending unsubscribe_from_quotes_stream request`);
    return this.websocketsClients.send(ws, params);
  }

  // subscribe_to_snapshots_stream
  public async subscribeToSnapshotsStream({
    ws,
    instruments,
  }: {
    ws: WebSocket,
    instruments: string[],
  }): Promise<void> {
    const params = {
      method: 'subscribe_to_snapshots_stream',
      version: this.VERSION,
      req_id: 1,
      instruments,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending subscribe_to_snapshots_stream request`);
    await this.websocketsClients.send(ws, params);
  }

  // unsubscribe_from_snapshots_stream
  public async unsubscribeFromSnapshotsStream({
    ws,
    instruments,
  }: {
    ws: WebSocket,
    instruments: string[],
  }): Promise<void> {
    const params = {
      method: 'unsubscribe_from_snapshots_stream',
      version: this.VERSION,
      req_id: 1,
      instruments,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending unsubscribe_from_snapshots_stream request`);
    await this.websocketsClients.send(ws, params);
  }

  // subscribe_to_positions_update
  public async subscribeToPositionsUpdate({
    ws,
    userId,
  }: {
    ws: WebSocket,
    userId: number,
  }): Promise<void> {
    const params = {
      method: 'subscribe_to_positions_update',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending subscribe_to_positions_update request`);
    await this.websocketsClients.send(ws, params);
  }

  // unsubscribe_from_positions_update
  public async unsubscribeFromPositionsUpdate({
    ws,
    userId,
  }: {
    ws: WebSocket,
    userId: number,
  }): Promise<void> {
    const params = {
      method: 'unsubscribe_from_positions_update',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending unsubscribe_from_positions_update request`);
    await this.websocketsClients.send(ws, params);
  }

  // subscribe_to_user_update
  public async subscribeToUserUpdate({
    ws,
    userId,
  }: {
    ws: WebSocket,
    userId: number,
  }): Promise<void> {
    const params = {
      method: 'subscribe_to_user_update',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending subscribe_to_user_update request`);
    await this.websocketsClients.send(ws, params);
  }

  // unsubscribe_from_user_update
  public async unsubscribeFromUserUpdate({
    ws,
    userId,
  }: {
    ws: WebSocket,
    userId: number,
  }): Promise<void> {
    const params = {
      method: 'unsubscribe_from_user_update',
      version: this.VERSION,
      req_id: 1,
      user_id: userId,
    };

    this.logger.verbose(params);
    this.logger.log(`Sending unsubscribe_from_user_update request`);
    await this.websocketsClients.send(ws, params);
  }
}


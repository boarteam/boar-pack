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
  MTResponse
} from "./dto/amts-dc.dto";
import WebSocket from "ws";

@Injectable()
export class AmtsDcService {
  private readonly logger = new Logger(AmtsDcService.name);
  private readonly VERSION = 10;

  constructor(
    private httpService: HttpService,
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

  public checkStreamConnection(url: string): Promise<void> {
    this.logger.log(`Checking WS connection to ${url}`);
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.on('open', () => {
        resolve();
        ws.close();
      });

      ws.on('error', (e) => {
        this.logger.error(`Error on WS connection to ${url}`);
        this.logger.error(e);
        reject(e);
        ws.close();
      });

      ws.on('close', () => {
        reject(new Error('Connection closed'));
      });
    });
  }

  public getQuotesWebsocket({
    url,
    auth,
    instruments,
    options,
  }: {
    url: string,
    auth: MTLoginResult,
    instruments: string[],
    options?: Partial<MTAttachStreamRequest>
  }): WebSocket {
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

    this.logger.log(`Attaching stream to ${url}`);
    this.logger.verbose(data);
    const ws = new WebSocket(url);

    ws.on('error', (e) => {
      this.logger.error(`Error on WS connection to ${url}`);
      this.logger.error(e);
      ws.close();
    });

    ws.on('open', () => {
      this.logger.log(`Sending attach_stream request to ${url}`);
      ws.send(JSON.stringify(data), (err) => {
        if (err) {
          this.logger.error(`Error sending attach_stream request to ${url}`);
          this.logger.error(err);
          ws.close();
        }
      });
    });

    return ws;
  }
}


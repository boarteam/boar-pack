import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebSocket } from "ws";
import { TUser } from "../users/entities/user.entity";
import { IncomingMessage } from "http";
import passport from "passport";
import { Interval } from "@nestjs/schedule";
import { WS_AUTH_STRATEGY } from "./ws-auth.constants";

declare module 'ws' {
  interface WebSocket {
    user?: TUser;
  }
}

export interface EventDto {
  event: string;
  data: any;
}

@Injectable()
export class WsAuthService {
  private logger = new Logger(WsAuthService.name);
  private socketsAuthenticators = new WeakMap<WebSocket, Promise<TUser | null>>();

  private clients: Set<WebSocket> = new Set();
  private clientsToTerminate: Set<WebSocket> = new Set();

  constructor(
    @Inject(WS_AUTH_STRATEGY) private readonly strategy: string,
  ) {
  }

  public handleConnection(socket: WebSocket, req: IncomingMessage) {
    this.logger.debug(`Client connected`);

    this.socketsAuthenticators.set(socket, new Promise<TUser | null>((resolve) => {
      passport.authenticate(this.strategy, (err: Error, user: TUser) => {
        this.logger.debug(`Authenticating user`);

        if (err) {
          this.logger.error(err, err.stack);
          return resolve(null);
        }
        if (!user) {
          this.logger.warn(`User was not taken by ${this.strategy} auth strategy`);
          return resolve(null);
        }

        socket.user = user;
        this.addClient(socket);
        resolve(user);
      })(req, null, (e: Error | null) => {
        if (e) {
          this.logger.error(e, e.stack);
          return resolve(null);
        }
      });
    }));
  }

  public async finishInitialization(socket: WebSocket): Promise<TUser | null> {
    return await this.socketsAuthenticators.get(socket) || null;
  }

  public handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
  }

  public broadcast(event: EventDto) {
    const eventStr = JSON.stringify(event);
    for (const client of this.clients) {
      client.send(eventStr, (err) => {
        if (err) {
          this.logger.error(`Error sending event to client: ${err.message}`);
        }
      });
    }
  }

  private addClient(client: WebSocket) {
    if (this.clients.has(client)) {
      return;
    }

    this.clients.add(client);
    client.on('pong', () => {
      this.clientsToTerminate.delete(client);
    });
  }

  @Interval(5000)
  private checkClients() {
    this.clients.forEach((client) => {
      if (this.clientsToTerminate.has(client)) {
        client.terminate();
        this.clients.delete(client);
      } else {
        this.clientsToTerminate.add(client);
        client.ping();
      }
    });
  }
}

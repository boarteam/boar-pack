import { Logger } from '@nestjs/common';
import { WebSocket } from "ws";
import { TUser } from "../users/entities/user.entity";
import { IncomingMessage } from "http";
import passport from "passport";
import { JWT_AUTH } from "../auth/auth-strategies.constants";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from "@nestjs/websockets";
import { Interval } from "@nestjs/schedule";

export interface AuthSocket extends WebSocket {
  user?: TUser;
}

@WebSocketGateway()
export class WsAuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(WsAuthGateway.name);
  private socketsAuthenticators = new WeakMap<WebSocket, Promise<TUser | null>>();

  private clients: Set<WebSocket> = new Set();
  private clientsToTerminate: Set<WebSocket> = new Set();

  public handleConnection(socket: AuthSocket, req: IncomingMessage) {
    this.logger.debug(`Client connected`);

    this.socketsAuthenticators.set(socket, new Promise<TUser | null>((resolve) => {
      passport.authenticate(JWT_AUTH, (err: Error, user: TUser) => {
        if (err) {
          this.logger.error(err, err.stack);
          return resolve(null);
        }
        if (!user) {
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

import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from "ws";
import { TUser } from "../users/entities/user.entity";
import { IncomingMessage } from "http";
import passport from "passport";
import { JWT_AUTH } from "../auth/auth-strategies.constants";

export interface AuthSocket extends WebSocket {
  user?: TUser;
}

@Injectable()
export class WsAuthService {
  private logger = new Logger(WsAuthService.name);
  private socketsAuthenticators = new WeakMap<WebSocket, Promise<TUser | null>>();

  onClientConnect(socket: AuthSocket, req: IncomingMessage) {
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
        resolve(user);
      })(req, null, (e: Error | null) => {
        if (e) {
          this.logger.error(e, e.stack);
          return resolve(null);
        }
      });
    }));
  }

  async finishInitialization(socket: WebSocket): Promise<TUser | null> {
    return await this.socketsAuthenticators.get(socket) || null;
  }
}

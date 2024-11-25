import {
  OnGatewayConnection,
  WebSocketGateway
} from "@nestjs/websockets";
import { WebSocket } from "ws";
import { forwardRef, Inject, Logger } from "@nestjs/common";
import { MtEmulatorService } from "./mt-emulator.service";

@WebSocketGateway()
export class MtEmulatorGateway implements OnGatewayConnection {
  private readonly logger = new Logger(MtEmulatorGateway.name);
  private readonly clients = new Set<WebSocket>();

  constructor(
    @Inject(forwardRef(() => MtEmulatorService))
    private readonly mtEmulatorService: MtEmulatorService,
  ) {}

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected to mt emulator');
    const subscription = this.mtEmulatorService.getQuotesStream().subscribe((quote) => {
      client.send(quote, (err) => {
        if (err) {
          this.logger.error(`Error sending quote to mt emulator client: ${err.message}`);
        }
      });
    });

    const positionSubscription = this.mtEmulatorService.getPositionsStream().subscribe((position) => {

      client.send(position, (err) => {
        if (err) {
          this.logger.error(`Error sending position to mt emulator client: ${err.message}`);
        }
      });
    });

    client.on('close', () => {
      this.logger.log('Client disconnected from mt emulator');
      subscription.unsubscribe();
      positionSubscription.unsubscribe();
      this.clients.delete(client);
    });

    this.clients.add(client);
  }

  broadcast(message: string) {
    this.clients.forEach(client => client.send(message, (err) => {
      if (err) {
        this.logger.error(`Error sending quote to mt emulator client: ${err.message}`);
      }
    }));
  }
}

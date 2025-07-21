import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { WebsocketsErrorEventDto } from "./dto/websockets.dto";

@Catch()
export class WebsocketsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: Error | WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    client.send(JSON.stringify({
      event: 'error',
      data: {
        message: exception.message,
        details: exception instanceof WsException ? (exception.getError() as any)?.details : undefined,
      },
    } as WebsocketsErrorEventDto));

    super.catch(exception, host);
  }
}

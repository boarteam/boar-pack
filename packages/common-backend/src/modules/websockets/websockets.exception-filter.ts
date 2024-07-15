import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { WebsocketsErrorEventDto } from "./dto/websockets.dto";

@Catch()
export class WebsocketsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    client.send(JSON.stringify({
      event: 'error',
      data: {
        message: exception.message,
      },
    } as WebsocketsErrorEventDto));

    super.catch(exception, host);
  }
}

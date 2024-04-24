import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ScryptService } from "@jifeon/boar-pack-common-backend";

@Injectable()
export class LiquidityManagersInterceptor implements NestInterceptor {
  constructor(
    private scryptService: ScryptService,
  ) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    if (req.body?.pass) {
      req.body.pass = await this.scryptService.encrypt(req.body.pass);
    }

    return next.handle();
  }
}

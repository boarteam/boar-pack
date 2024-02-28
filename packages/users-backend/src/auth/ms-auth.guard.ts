import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MS_AUTH } from './auth-strategies.constants';

@Injectable()
export class MSAuthGuard extends AuthGuard(MS_AUTH) {

}

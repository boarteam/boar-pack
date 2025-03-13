import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { YANDEX_AUTH } from '../auth-strategies.constants';

@Injectable()
export class YandexAuthGuard extends AuthGuard(YANDEX_AUTH) {}

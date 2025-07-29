import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_AUTH_REFRESH } from '../auth/auth-strategies.constants';

@Injectable()
export class JwtAuthRefreshGuard extends AuthGuard(JWT_AUTH_REFRESH) {
}

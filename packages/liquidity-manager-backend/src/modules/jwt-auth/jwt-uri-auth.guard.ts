import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_URI_AUTH } from '../auth/auth-strategies.constants';

@Injectable()
export class JwtUriAuthGuard extends AuthGuard(JWT_URI_AUTH) {}

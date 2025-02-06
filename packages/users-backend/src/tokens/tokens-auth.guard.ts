import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TOKENS_AUTH } from "./tokens.constants";

@Injectable()
export class TokenAuthGuard extends AuthGuard(TOKENS_AUTH) {
}

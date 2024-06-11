export class LocalAuthLoginDto {
  name: string;
  password: string;
  rememberMe: boolean;
}

export class LocalAuthTokenDto {
  accessToken: string;
}

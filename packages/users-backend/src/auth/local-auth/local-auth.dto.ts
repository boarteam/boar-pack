import { TJWTPayload, TJWTRefreshPayload } from "../../jwt-auth";

export class LocalAuthLoginDto {
  email: string;
  password: string;
}

export class LocalAuthTokenDto {
  accessToken: {
    token: string;
    payload: TJWTPayload;
  };
  refreshToken: {
    token: string;
    payload: TJWTRefreshPayload;
  }
}

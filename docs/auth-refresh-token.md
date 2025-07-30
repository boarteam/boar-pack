# Refresh Token and Session Revocation

Commit [`75bdcc7`](https://github.com/boarteam/boar-pack/commit/75bdcc76d5e824d9da70cc24a30a19a7bd98eb8b) introduces refresh token support to the authentication subsystem. The update allows issued sessions to be invalidated and refreshed through a dedicated endpoint.

## Configuration

The users backend now reads three environment variables:

- `ACCESS_TOKEN_EXPIRATION` – lifetime of access tokens (default `1h`).
- `REFRESH_TOKEN_EXPIRATION` – lifetime of refresh tokens (default `7d`).
- `REFRESH_TOKEN_PATH` – URL path for the refresh endpoint (default `/api/auth/refresh`).

These are exposed through `JWTAuthConfigService` and `AuthConfigService` so other modules can rely on the configured values.

## Token Structure

Access and refresh tokens now carry a session identifier (`sid`) and are returned together:

```ts
export class LocalAuthTokenDto {
  accessToken: {
    token: string;
    payload: TJWTPayload;
  };
  refreshToken: {
    token: string;
    payload: TJWTRefreshPayload;
  };
}
```

Both tokens include their payload so expiration values can be used when setting cookies.

## Cookies

`AuthService` manages cookies for the two tokens. `setCookie` stores them under `auth_token` and `auth_refresh_token` with `maxAge` derived from the JWT payload. The refresh cookie uses `REFRESH_TOKEN_PATH` to scope the cookie only to the refresh route. `clearCookies` removes both cookies during logout.

## Revocation Logic

Revoked tokens now store a `tokenType` (`access`, `refresh` or `session`). When revoking a token with a session ID, an additional entry with type `session` is created so the entire session can be invalidated. Revocation checks consult both the token JTI and its session ID.

A background task clears expired revoked tokens every hour.

## Refresh Strategy

`JwtAuthRefreshStrategy` validates refresh tokens from either the `Authorization` header or the `auth_refresh_token` cookie. When a valid token is used it is immediately revoked to prevent reuse. The corresponding user is loaded and attached to the request.

`JwtAuthRefreshGuard` binds this strategy for controller routes.

## Endpoints

`AuthController` exposes a new `/auth/refresh` endpoint guarded by `JwtAuthRefreshGuard`. Upon successful validation, new access and refresh tokens are issued and set in cookies.

```
POST /auth/refresh
```

## Client API

The generated API client now includes a `refresh()` method to call the refresh endpoint. `LocalAuthTokenDto` type was updated to match the new token structure.

## Usage Example

1. Log in via `/auth/login` or social providers to receive both tokens.
2. Use the `/auth/token` endpoint to obtain a fresh pair when already authenticated.
3. When the access token expires, send a request to `/auth/refresh` with the refresh token cookie to obtain new tokens.
4. Call `/auth/logout` to revoke the current token and clear cookies.

This functionality enables persistent sessions with strong revocation guarantees.

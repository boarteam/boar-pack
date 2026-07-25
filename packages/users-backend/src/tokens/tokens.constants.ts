export const TOKENS_AUTH = 'tokens';

// API tokens are issued as `<token uuid>.<secret>`; JWTs always carry three
// dot-separated segments, so the two credential shapes never overlap.
const API_TOKEN_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[^.]+$/i;

export function isApiTokenCredential(credential: string): boolean {
  return API_TOKEN_PATTERN.test(credential);
}

export function extractBearerCredential(authorization?: string): string | null {
  if (!authorization) {
    return null;
  }

  const [scheme, credential] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' && credential ? credential : null;
}

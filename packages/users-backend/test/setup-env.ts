// Dummy values for config services that hard-require env vars.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
// Low cost factor keeps bcrypt fast in tests.
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '4';
process.env.ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '1h';
process.env.REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
process.env.SECURE_COOKIE = process.env.SECURE_COOKIE || 'false';

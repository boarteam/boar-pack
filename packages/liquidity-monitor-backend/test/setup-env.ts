// Dummy values for config services that hard-require env vars (pulled in
// via the users-backend modules some of these modules depend on).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '4';

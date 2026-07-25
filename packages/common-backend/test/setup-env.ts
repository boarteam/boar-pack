// Dummy values for config services that hard-require env vars.
process.env.SCRYPT_SALT = process.env.SCRYPT_SALT || 'test-salt';
process.env.SCRYPT_IV = process.env.SCRYPT_IV || '1234567890123456';

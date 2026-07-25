import { ConfigService } from '@nestjs/config';
import { BcryptConfigService } from './bcrypt.config';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env.BCRYPT_SALT_ROUNDS = ORIGINAL_ENV.BCRYPT_SALT_ROUNDS;
    if (ORIGINAL_ENV.EXPERIMENTAL_FEATURES === undefined) {
      delete process.env.EXPERIMENTAL_FEATURES;
    } else {
      process.env.EXPERIMENTAL_FEATURES = ORIGINAL_ENV.EXPERIMENTAL_FEATURES;
    }
  });

  function createService(): BcryptService {
    return new BcryptService(new BcryptConfigService(new ConfigService()));
  }

  it('hashes a password and verifies it with compare', async () => {
    const service = createService();
    const hash = await service.hashPassword('s3cret');

    expect(hash).not.toBe('s3cret');
    await expect(service.compare('s3cret', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const service = createService();
    const hash = await service.hashPassword('s3cret');

    await expect(service.compare('not-the-password', hash)).resolves.toBe(false);
  });

  it('salts hashes: hashing the same input twice yields different hashes, both valid', async () => {
    const service = createService();
    const a = await service.hashPassword('same-input');
    const b = await service.hashPassword('same-input');

    expect(a).not.toBe(b);
    await expect(service.compare('same-input', a)).resolves.toBe(true);
    await expect(service.compare('same-input', b)).resolves.toBe(true);
  });

  it('uses BCRYPT_SALT_ROUNDS as the bcrypt cost factor', async () => {
    // setup-env presets BCRYPT_SALT_ROUNDS=4; the cost is embedded in the hash.
    const hash = await createService().hashPassword('x');
    expect(hash).toMatch(/^\$2[aby]\$04\$/);

    process.env.BCRYPT_SALT_ROUNDS = '5';
    const hash5 = await createService().hashPassword('x');
    expect(hash5).toMatch(/^\$2[aby]\$05\$/);
  });

  it('throws at construction when BCRYPT_SALT_ROUNDS is missing', () => {
    delete process.env.BCRYPT_SALT_ROUNDS;
    expect(() => createService()).toThrow(
      'BCRYPT_SALT_ROUNDS is not defined, set it as integer',
    );
  });

  it('throws at construction when BCRYPT_SALT_ROUNDS is not an integer', () => {
    process.env.BCRYPT_SALT_ROUNDS = 'not-a-number';
    expect(() => createService()).toThrow(
      'BCRYPT_SALT_ROUNDS is not defined, set it as integer',
    );
  });

  describe('BcryptConfigService', () => {
    it('splits EXPERIMENTAL_FEATURES into an array', () => {
      process.env.EXPERIMENTAL_FEATURES = 'featA,featB';
      const config = new BcryptConfigService(new ConfigService()).config;
      expect(config).toEqual({
        saltRounds: 4,
        experimentalFeatures: ['featA', 'featB'],
      });
    });

    it('defaults experimentalFeatures to an empty array', () => {
      delete process.env.EXPERIMENTAL_FEATURES;
      const config = new BcryptConfigService(new ConfigService()).config;
      expect(config.experimentalFeatures).toEqual([]);
    });
  });
});

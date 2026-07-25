import { Test } from '@nestjs/testing';
import { ScryptModule } from './scrypt.module';
import { ScryptService } from './scrypt.service';

describe('ScryptService', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env.SCRYPT_SALT = ORIGINAL_ENV.SCRYPT_SALT;
    process.env.SCRYPT_IV = ORIGINAL_ENV.SCRYPT_IV;
  });

  async function createService(): Promise<ScryptService> {
    const moduleRef = await Test.createTestingModule({
      imports: [ScryptModule],
    }).compile();
    return moduleRef.get(ScryptService);
  }

  it('decrypts what it encrypted (roundtrip)', async () => {
    const service = await createService();
    const secret = 'p@ssw0rd with unicode ✓ and spaces';

    const encrypted = await service.encrypt(secret);

    expect(encrypted).not.toBe(secret);
    // base64 output
    expect(Buffer.from(encrypted, 'base64').toString('base64')).toBe(encrypted);
    await expect(service.decrypt(encrypted)).resolves.toBe(secret);
  });

  it('produces stable ciphertext for the same input and key material', async () => {
    // AES-CTR with a fixed IV is deterministic — document that property.
    const service = await createService();
    const a = await service.encrypt('same-input');
    const b = await service.encrypt('same-input');
    expect(a).toBe(b);
  });

  it('fails module creation when SCRYPT_SALT / SCRYPT_IV are missing', async () => {
    delete process.env.SCRYPT_SALT;
    await expect(createService()).rejects.toThrow(
      'SCRYPT_SALT or SCRYPT_IV env variables are not set',
    );
  });

  it('fails module creation when the IV is not 16 hex characters', async () => {
    process.env.SCRYPT_IV = 'not-hex-not-16!';
    await expect(createService()).rejects.toThrow('IV is invalid, check SCRYPT_IV env variable');
  });
});

import { Injectable } from "@nestjs/common";
import { ScryptConfigService, TScryptConfig } from "./scrypt.config";
import { promisify } from "util";
import { createCipheriv, scrypt } from "crypto";

@Injectable()
export class ScryptService {
  private config: TScryptConfig;

  constructor(
    private scryptConfig: ScryptConfigService,
  ) {
    this.config = this.scryptConfig.config;
  }

  async encrypt(str: string): Promise<string> {
    const key = (await promisify(scrypt)(this.config.salt, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, this.config.iv);

    const encrypted = Buffer.concat([
      cipher.update(str),
      cipher.final(),
    ]);

    return encrypted.toString('base64');
  }

  async decrypt(str: string): Promise<string> {
    const key = (await promisify(scrypt)(this.config.salt, 'salt', 32)) as Buffer;
    const decipher = createCipheriv('aes-256-ctr', key, this.config.iv);

    const decrypted = Buffer.concat([
      decipher.update(str, 'base64'),
      decipher.final(),
    ]);

    return decrypted.toString();
  }
}

export default ScryptService;

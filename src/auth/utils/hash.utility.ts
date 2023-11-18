import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export class HashUtility {
  async hash(plainTextPassword: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(plainTextPassword, salt, 32)) as Buffer;

    const saltWithHash = salt + '.' + hash.toString('hex');

    return saltWithHash;
  }

  async validate(
    plainTextPassword: string,
    saltWithHash: string,
  ): Promise<boolean> {
    const [salt, hashedPassword] = saltWithHash.split('.');

    const hash = (await scrypt(plainTextPassword, salt, 32)) as Buffer;

    if (hashedPassword !== hash.toString('hex')) {
      return false;
    }

    return true;
  }
}

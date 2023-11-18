import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export class HashUtility {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const saltWithHash = salt + '.' + hash.toString('hex');

    return saltWithHash;
  }

  async validate(password: string): Promise<boolean> {
    const [salt, hashedPassword] = password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hashedPassword !== hash.toString('hex')) {
      return false;
    }

    return true;
  }
}

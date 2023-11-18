import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export class HashService {
  /**
   * Hash plain text strings
   * @param plainTextPassword
   * @returns saltWithHash a single string concatenated with this format `salt.hash`
   */
  async hash(plainTextPassword: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(plainTextPassword, salt, 32)) as Buffer;

    const saltWithHash = salt + '.' + hash.toString('hex');

    return saltWithHash;
  }

  /**
   * Function return weather or not plainTextPassword and saltWithHash combination is valid
   * @param plainTextPassword
   * @param saltWithHash
   * @returns isValid boolean determine if plainTextPassword and saltWithHash combination is valid
   */
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

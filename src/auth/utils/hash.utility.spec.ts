import { Test, TestingModule } from '@nestjs/testing';
import { HashUtility } from './hash.utility';

describe('HashUtility', () => {
  let hashUtility: HashUtility;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashUtility],
    }).compile();

    hashUtility = module.get<HashUtility>(HashUtility);
  });

  it('should be defined', () => {
    expect(hashUtility).toBeDefined();
  });

  it('should hash password correctly', async () => {
    const saltWithHash = await hashUtility.hash('123');

    const [salt, hash] = saltWithHash.split('.');

    expect(saltWithHash).not.toBe('123');
    expect(salt.length).toBeGreaterThan(10);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('should fail due to wrong password', async () => {
    const saltWithHash = await hashUtility.hash('123');

    const isValid = await hashUtility.validate('1233', saltWithHash);

    expect(isValid).toBe(false);
  });

  it('should fail due to invalid hash', async () => {
    const isValid = await hashUtility.validate('123', 'invalid hash');

    expect(isValid).toBe(false);
  });

  it('should validate password correctly', async () => {
    const saltWithHash = await hashUtility.hash('123');

    const isValid = await hashUtility.validate('123', saltWithHash);

    expect(isValid).toBe(true);
  });
});

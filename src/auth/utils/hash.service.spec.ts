import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    hashService = module.get<HashService>(HashService);
  });

  it('should be defined', () => {
    expect(hashService).toBeDefined();
  });

  it('should hash password correctly', async () => {
    const saltWithHash = await hashService.hash('123');

    const [salt, hash] = saltWithHash.split('.');

    expect(saltWithHash).not.toBe('123');
    expect(salt.length).toBeGreaterThan(10);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('should fail due to wrong password', async () => {
    const saltWithHash = await hashService.hash('123');

    const isValid = await hashService.validate('1233', saltWithHash);

    expect(isValid).toBe(false);
  });

  it('should fail due to invalid hash', async () => {
    const isValid = await hashService.validate('123', 'invalid hash');

    expect(isValid).toBe(false);
  });

  it('should validate password correctly', async () => {
    const saltWithHash = await hashService.hash('123');

    const isValid = await hashService.validate('123', saltWithHash);

    expect(isValid).toBe(true);
  });
});

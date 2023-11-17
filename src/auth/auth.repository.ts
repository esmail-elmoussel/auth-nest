import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository {
  register() {
    return 'register from repo!';
  }
}
